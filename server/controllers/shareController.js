const Work = require('../models/Work');
const crypto = require('crypto');

// 创建或更新作品分享链接
exports.createShareLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { shareExpiry } = req.body;
    
    const work = await Work.findById(id);
    
    if (!work) {
      return res.status(404).json({ message: '作品不存在' });
    }
    
    // 检查权限
    if (work.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权为此作品创建分享链接' });
    }
    
    // 生成新的分享链接
    const shareLink = crypto.randomBytes(16).toString('hex');
    
    // 更新作品
    work.shareLink = shareLink;
    work.shareExpiry = shareExpiry || null;
    work.updatedAt = Date.now();
    
    await work.save();
    
    res.json({ shareLink: work.shareLink, shareExpiry: work.shareExpiry });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 获取分享作品
exports.getSharedWork = async (req, res) => {
  try {
    const { shareLink } = req.params;
    
    const work = await Work.findOne({ shareLink })
      .populate('owner', 'username nickname')
      .populate('archive', 'name');
    
    if (!work) {
      return res.status(404).json({ message: '作品不存在或链接已失效' });
    }
    
    // 检查分享链接是否过期
    if (work.shareExpiry && new Date() > new Date(work.shareExpiry)) {
      return res.status(403).json({ message: '分享链接已过期' });
    }
    
    // 增加查看次数
    work.viewCount += 1;
    await work.save();
    
    // 如果作品需要密码保护，则不返回文件路径
    if (work.isPasswordProtected) {
      const workObj = work.toObject();
      delete workObj.filePath;
      return res.json({
        ...workObj,
        requiresPassword: true
      });
    }
    
    res.json(work);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};
