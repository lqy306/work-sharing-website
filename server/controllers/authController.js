const User = require('../models/User');
const InviteCode = require('../models/InviteCode');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const bcrypt = require('bcryptjs');

// 用户注册
exports.register = async (req, res) => {
  const { username, password, nickname, inviteCode } = req.body;

  try {
    // 验证邀请码
    const inviteCodeDoc = await InviteCode.findOne({ code: inviteCode, isUsed: false });
    if (!inviteCodeDoc) {
      return res.status(400).json({ message: '无效的邀请码' });
    }

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
      role: 'user'
    });

    // 保存用户
    await user.save();

    // 更新邀请码状态
    inviteCodeDoc.isUsed = true;
    inviteCodeDoc.usedBy = user._id;
    await inviteCodeDoc.save();

    // 创建JWT令牌
    const payload = {
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      config.jwtSecret,
      { expiresIn: config.jwtExpiration },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 用户登录
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // 查找用户
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: '用户名或密码错误' });
    }

    // 验证密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: '用户名或密码错误' });
    }

    // 创建JWT令牌
    const payload = {
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      config.jwtSecret,
      { expiresIn: config.jwtExpiration },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};

// 获取当前用户信息
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('服务器错误');
  }
};
