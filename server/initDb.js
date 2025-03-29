const mongoose = require('mongoose');
const User = require('./models/User');
const InviteCode = require('./models/InviteCode');
const config = require('./config/config');
const bcrypt = require('bcryptjs');

// 连接数据库
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('MongoDB 连接成功');
  
  try {
    // 检查管理员账号是否已存在
    const adminExists = await User.findOne({ username: 'lqy' });
    
    if (!adminExists) {
      // 创建管理员账号
      const admin = new User({
        username: 'lqy',
        password: 'lqy2291107',
        nickname: '管理员',
        role: 'admin'
      });
      
      await admin.save();
      console.log('管理员账号创建成功');
      
      // 创建初始邀请码
      const inviteCode = new InviteCode({
        code: 'INITIAL_INVITE_CODE',
        createdBy: admin._id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天后过期
      });
      
      await inviteCode.save();
      console.log('初始邀请码创建成功');
    } else {
      console.log('管理员账号已存在');
    }
  } catch (err) {
    console.error('初始化数据失败:', err);
  }
  
  // 断开数据库连接
  mongoose.disconnect();
})
.catch(err => {
  console.error('MongoDB 连接失败:', err);
});
