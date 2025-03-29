const mongoose = require('mongoose');

const InviteCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      // 默认30天有效期
      const date = new Date();
      date.setDate(date.getDate() + 30);
      return date;
    }
  }
});

module.exports = mongoose.model('InviteCode', InviteCodeSchema);
