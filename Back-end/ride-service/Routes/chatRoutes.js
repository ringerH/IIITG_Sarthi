const express = require('express');
const verifyAuth = require('../middleware/authMiddleware');
const Chat = require('../Models/Chat');
const socketUtil = require('../utils/socket');

const router = express.Router();

// GET chat by id (returns chat with messages)
router.get('/chats/:id', verifyAuth, async (req, res) => {
  try {
    const chatId = req.params.id;
    const chat = await Chat.findById(chatId).lean();
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    return res.json({ success: true, chat });
  } catch (err) {
    console.error('Error fetching chat:', err);
    return res.status(500).json({ message: 'Error fetching chat' });
  }
});

// POST a message to a chat (persist + emit)
router.post('/chats/:id/messages', verifyAuth, async (req, res) => {
  try {
    const chatId = req.params.id;
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ message: 'Missing text' });

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    const senderId = req.user?.id || req.user?._id;
    const message = { senderId: String(senderId), text, createdAt: new Date() };
    chat.messages.push(message);
    await chat.save();

    // Emit to chat room via socket.io if available
    const io = socketUtil.getIO();
    try {
      if (io) io.to(chatId).emit('message', { chatId, ...message });
    } catch (e) {
      console.error('Error emitting socket message:', e);
    }

    return res.json({ success: true, message });
  } catch (err) {
    console.error('Error posting message:', err);
    return res.status(500).json({ message: 'Error posting message' });
  }
});

module.exports = router;
