const User = require('../models/User');
const InviteCode = require('../models/InviteCode');
const bcrypt = require('bcryptjs');

// 获取用户列表（仅管理员可用）
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 获取单个用户信息
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 检查权限
    if (user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权访问此用户信息' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 更新用户信息
exports.updateUser = async (req, res) => {
  try {
    const { nickname } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 检查权限
    if (user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权更新此用户信息' });
    }
    
    // 更新字段
    if (nickname) user.nickname = nickname;
    
    user.updatedAt = Date.now();
    
    await user.save();
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 更新用户密码
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 检查权限
    if (user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权更新此用户密码' });
    }
    
    // 如果不是管理员，需要验证当前密码
    if (req.user.role !== 'admin') {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: '当前密码错误' });
      }
    }
    
    // 更新密码
    user.password = newPassword;
    user.updatedAt = Date.now();
    
    await user.save();
    
    res.json({ message: '密码已更新' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 删除用户
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 检查权限
    if (user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权删除此用户' });
    }
    
    // 不允许删除管理员账号
    if (user.role === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权删除管理员账号' });
    }
    
    await user.remove();
    
    res.json({ message: '用户已删除' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 创建用户（仅管理员可用）
exports.createUser = async (req, res) => {
  try {
    const { username, password, nickname, role } = req.body;
    
    // 检查用户名是否已存在
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: '用户名已存在' });
    }
    
    // 创建新用户
    user = new User({
      username,
      password,
      nickname: nickname || username,
      role: role || 'user'
    });
    
    await user.save();
    
    res.status(201).json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 获取邀请码列表（仅管理员可用）
exports.getInviteCodes = async (req, res) => {
  try {
    const inviteCodes = await InviteCode.find()
      .populate('createdBy', 'username nickname')
      .populate('usedBy', 'username nickname')
      .sort({ createdAt: -1 });
    
    res.json(inviteCodes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 创建邀请码（仅管理员可用）
exports.createInviteCode = async (req, res) => {
  try {
    const { expiresAt } = req.body;
    
    // 生成随机邀请码
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    // 创建邀请码
    const inviteCode = new InviteCode({
      code,
      createdBy: req.user.id,
      expiresAt: expiresAt || null
    });
    
    await inviteCode.save();
    
    res.status(201).json(inviteCode);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 删除邀请码（仅管理员可用）
exports.deleteInviteCode = async (req, res) => {
  try {
    const inviteCode = await InviteCode.findById(req.params.id);
    
    if (!inviteCode) {
      return res.status(404).json({ message: '邀请码不存在' });
    }
    
    await inviteCode.remove();
    
    res.json({ message: '邀请码已删除' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};
