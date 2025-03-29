const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const config = require('./config/config');

// 初始化Express应用
const app = express();

// 中间件
app.use(express.json());
app.use(cors());

// 连接数据库
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB 连接成功'))
.catch(err => console.error('MongoDB 连接失败:', err));

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/works', require('./routes/works'));
app.use('/api/archives', require('./routes/archives'));
app.use('/api', require('./routes/share'));
app.use('/api/users', require('./routes/users'));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 在生产环境中提供前端静态文件
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// 定义端口
const PORT = process.env.PORT || 5000;

// 启动服务器
app.listen(PORT, () => console.log(`服务器运行在端口 ${PORT}`));
