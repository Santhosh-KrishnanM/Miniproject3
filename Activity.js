const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, required: true }, // e.g. 'visit', 'favorite', 'booking', etc.
  content: String,
  destinationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', activitySchema);