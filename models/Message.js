const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  userMessage: String,
  botReply: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Message', messageSchema);
