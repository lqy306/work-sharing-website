const mongoose = require('mongoose');

const WorkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  filePath: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  isPasswordProtected: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    default: null
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  archive: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Archive',
    default: null
  },
  shareLink: {
    type: String,
    default: null
  },
  shareExpiry: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  viewCount: {
    type: Number,
    default: 0
  }
});

// 密码加密中间件
WorkSchema.pre('save', async function(next) {
  if (this.isPasswordProtected && this.isModified('password')) {
    try {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// 验证密码方法
WorkSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.isPasswordProtected) return true;
  if (!this.password) return false;
  
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Work', WorkSchema);
