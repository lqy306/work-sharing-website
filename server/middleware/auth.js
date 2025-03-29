const jwt = require('jsonwebtoken');
const config = require('../config/config');

// 验证用户是否已登录
exports.auth = async (req, res, next) => {
  try {
    // 从请求头获取token
    const token = req.header('x-auth-token');
    
    // 检查是否有token
    if (!token) {
      return res.status(401).json({ message: '无访问权限，请先登录' });
    }

    // 验证token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // 将用户信息添加到请求对象
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: '无效的令牌，请重新登录' });
  }
};

// 验证用户是否为管理员
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: '需要管理员权限' });
  }
};
