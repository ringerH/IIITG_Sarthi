const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{ type: String, required: true }], // user ids
  messages: [
    {
      senderId: String,
      text: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
