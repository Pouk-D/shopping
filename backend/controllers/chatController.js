const ChatRoom = require('../models/ChatRoom');
const ChatMessage = require('../models/ChatMessage');

exports.getRooms = async (req, res, next) => {
  try {
    let rooms;
    if (req.user.role === 'user') {
      rooms = await ChatRoom.find({ customer: req.user._id })
        .populate('customer', 'name email').sort('-updatedAt');
    } else {
      rooms = await ChatRoom.find()
        .populate('customer', 'name email')
        .populate('closedBy', 'name').sort('-updatedAt');
    }
    res.json(rooms);
  } catch (err) { next(err); }
};

exports.createRoom = async (req, res, next) => {
  try {
    const existing = await ChatRoom.findOne({ customer: req.user._id, status: 'open' });
    if (existing) {
      await existing.populate('customer', 'name email');
      return res.json(existing);
    }
    const room = await ChatRoom.create({
      customer: req.user._id,
      title: `Chat with ${req.user.name}`
    });
    await room.populate('customer', 'name email');
    res.status(201).json(room);
  } catch (err) { next(err); }
};

exports.getMessages = async (req, res, next) => {
  try {
    const messages = await ChatMessage.find({ room: req.params.id }).sort('createdAt');
    res.json(messages);
  } catch (err) { next(err); }
};

exports.closeRoom = async (req, res, next) => {
  try {
    const room = await ChatRoom.findByIdAndUpdate(
      req.params.id,
      { status: 'closed', closedBy: req.user._id },
      { new: true }
    ).populate('customer', 'name email').populate('closedBy', 'name');
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (err) { next(err); }
};
