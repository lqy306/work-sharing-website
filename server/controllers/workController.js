const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Work = require('../models/Work');
const Archive = require('../models/Archive');
const crypto = require('crypto');

// 配置文件存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    
    // 确保上传目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 允许的文件类型
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/html', 'text/css', 'text/javascript',
    'application/json', 'application/xml',
    'video/mp4', 'video/mpeg', 'video/quicktime',
    'audio/mpeg', 'audio/wav', 'audio/ogg'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'), false);
  }
};

// 配置上传
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

// 上传作品
exports.uploadWork = async (req, res) => {
  try {
    upload.single('file')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: '请选择要上传的文件' });
      }
      
      const { title, description, archiveId, isPasswordProtected, password } = req.body;
      
      // 生成分享链接
      const shareLink = crypto.randomBytes(16).toString('hex');
      
      // 创建作品记录
      const work = new Work({
        title,
        description,
        filePath: req.file.path,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        owner: req.user.id,
        archive: archiveId || null,
        isPasswordProtected: isPasswordProtected === 'true',
        password: isPasswordProtected === 'true' ? password : null,
        shareLink
      });
      
      await work.save();
      
      res.status(201).json({ work });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 获取作品列表
exports.getWorks = async (req, res) => {
  try {
    const works = await Work.find({ owner: req.user.id })
      .populate('archive', 'name')
      .sort({ createdAt: -1 });
    
    res.json(works);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 获取单个作品
exports.getWork = async (req, res) => {
  try {
    const work = await Work.findById(req.params.id).populate('archive', 'name');
    
    if (!work) {
      return res.status(404).json({ message: '作品不存在' });
    }
    
    // 检查访问权限
    if (work.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权访问此作品' });
    }
    
    res.json(work);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 通过分享链接获取作品
exports.getWorkByShareLink = async (req, res) => {
  try {
    const { shareLink } = req.params;
    const work = await Work.findOne({ shareLink }).populate('archive', 'name');
    
    if (!work) {
      return res.status(404).json({ message: '作品不存在或链接已失效' });
    }
    
    // 检查分享链接是否过期
    if (work.shareExpiry && new Date() > work.shareExpiry) {
      return res.status(403).json({ message: '分享链接已过期' });
    }
    
    // 如果作品需要密码保护，则不返回文件路径
    if (work.isPasswordProtected) {
      const { filePath, ...workData } = work.toObject();
      return res.json({
        ...workData,
        requiresPassword: true
      });
    }
    
    res.json(work);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 验证作品密码
exports.verifyWorkPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    
    const work = await Work.findById(id);
    
    if (!work) {
      return res.status(404).json({ message: '作品不存在' });
    }
    
    // 管理员无需密码
    if (req.user && req.user.role === 'admin') {
      return res.json({ success: true, work });
    }
    
    // 作品所有者无需密码
    if (req.user && work.owner.toString() === req.user.id) {
      return res.json({ success: true, work });
    }
    
    // 如果作品不需要密码
    if (!work.isPasswordProtected) {
      return res.json({ success: true, work });
    }
    
    // 验证密码
    const isMatch = await work.comparePassword(password);
    
    if (!isMatch) {
      return res.status(400).json({ message: '密码错误' });
    }
    
    res.json({ success: true, work });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 更新作品
exports.updateWork = async (req, res) => {
  try {
    const { title, description, archiveId, isPasswordProtected, password } = req.body;
    
    const work = await Work.findById(req.params.id);
    
    if (!work) {
      return res.status(404).json({ message: '作品不存在' });
    }
    
    // 检查权限
    if (work.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权更新此作品' });
    }
    
    // 更新字段
    if (title) work.title = title;
    if (description !== undefined) work.description = description;
    if (archiveId !== undefined) work.archive = archiveId || null;
    
    // 更新密码保护
    if (isPasswordProtected !== undefined) {
      work.isPasswordProtected = isPasswordProtected === 'true';
      
      if (isPasswordProtected === 'true' && password) {
        work.password = password;
      } else if (isPasswordProtected === 'false') {
        work.password = null;
      }
    }
    
    work.updatedAt = Date.now();
    
    await work.save();
    
    res.json(work);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 删除作品
exports.deleteWork = async (req, res) => {
  try {
    const work = await Work.findById(req.params.id);
    
    if (!work) {
      return res.status(404).json({ message: '作品不存在' });
    }
    
    // 检查权限
    if (work.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权删除此作品' });
    }
    
    // 删除文件
    if (fs.existsSync(work.filePath)) {
      fs.unlinkSync(work.filePath);
    }
    
    await work.remove();
    
    res.json({ message: '作品已删除' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};
