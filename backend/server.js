const http    = require('http');
const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');
const jwt     = require('jsonwebtoken');
const { Server } = require('socket.io');

const connectDB     = require('./config/db');
const User          = require('./models/User');
const ChatMessage   = require('./models/ChatMessage');
const ChatRoom      = require('./models/ChatRoom');

dotenv.config();
connectDB();

const app    = express();
const server = http.createServer(app);

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:3001'];

const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true }
});

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// REST routes
app.use('/api/v1/auth',       require('./routes/auth'));
app.use('/api/v1/products',   require('./routes/products'));
app.use('/api/v1/categories', require('./routes/categories'));
app.use('/api/v1/cart',       require('./routes/cart'));
app.use('/api/v1/orders',     require('./routes/orders'));
app.use('/api/v1/users',      require('./routes/users'));
app.use('/api/v1/chat',       require('./routes/chat'));

app.use(require('./middleware/errorHandler'));

// Socket.io auth middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('No token'));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return next(new Error('User not found'));
    socket.user = user;
    next();
  } catch {
    next(new Error('Auth failed'));
  }
});

io.on('connection', (socket) => {
  const user = socket.user;

  // Admins join a shared room to receive new-room notifications
  if (user.role === 'admin' || user.role === 'super_admin') {
    socket.join('admins');
  }

  // Join a specific chat room
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
  });

  // Send a message
  socket.on('send_message', async ({ roomId, text }) => {
    try {
      const room = await ChatRoom.findById(roomId);
      if (!room || room.status === 'closed') return;

      const msg = await ChatMessage.create({
        room: roomId,
        sender: user._id,
        senderName: user.name,
        senderRole: user.role,
        text
      });

      // Update room updatedAt so it surfaces to top of admin list
      await ChatRoom.findByIdAndUpdate(roomId, { updatedAt: new Date() });

      io.to(roomId).emit('new_message', msg);
    } catch {}
  });

  // Notify admins of a newly created room
  socket.on('announce_room', (room) => {
    socket.to('admins').emit('new_room', room);
  });

  // Close a room
  socket.on('close_room', async (roomId) => {
    try {
      const room = await ChatRoom.findByIdAndUpdate(
        roomId,
        { status: 'closed', closedBy: user._id },
        { new: true }
      ).populate('customer', 'name email').populate('closedBy', 'name');

      io.to(roomId).emit('room_closed', { roomId, closedBy: user.name });
      io.to('admins').emit('room_updated', room);
    } catch {}
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
