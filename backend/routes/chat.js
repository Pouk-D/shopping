const router = require('express').Router();
const { getRooms, createRoom, getMessages, closeRoom } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.get('/rooms',              protect, getRooms);
router.post('/rooms',             protect, createRoom);
router.get('/rooms/:id/messages', protect, getMessages);
router.put('/rooms/:id/close',    protect, closeRoom);

module.exports = router;
