const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  room:       { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
  sender:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, required: true },
  text:       { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
