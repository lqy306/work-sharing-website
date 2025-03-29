const mongoose = require('mongoose');

const ArchiveSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Archive',
    default: null
  },
  path: {
    type: String,
    default: '/'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 创建索引以支持高效查询
ArchiveSchema.index({ owner: 1, path: 1 });
ArchiveSchema.index({ parent: 1 });

// 获取完整路径的方法
ArchiveSchema.methods.getFullPath = async function() {
  if (!this.parent) {
    return '/' + this.name;
  }
  
  try {
    const parentArchive = await mongoose.model('Archive').findById(this.parent);
    if (!parentArchive) return '/' + this.name;
    
    const parentPath = await parentArchive.getFullPath();
    return parentPath + '/' + this.name;
  } catch (error) {
    return '/' + this.name;
  }
};

// 获取所有子归档的方法
ArchiveSchema.methods.getChildren = async function() {
  try {
    return await mongoose.model('Archive').find({ parent: this._id });
  } catch (error) {
    return [];
  }
};

module.exports = mongoose.model('Archive', ArchiveSchema);
