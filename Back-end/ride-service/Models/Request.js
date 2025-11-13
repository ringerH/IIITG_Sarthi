const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  rideId: { type: String, required: true },
  rideTitle: { type: String },
  requesterId: { type: String, required: true },
  requesterName: { type: String },
  requesterEmail: { type: String },
  toUserId: { type: String }, // owner of the ride (may be null for older anonymous rides)
  toUserEmail: { type: String },
  chatId: { type: String },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
