# 作品分享网站部署指南

## 项目概述
这是一个功能完善的作品分享网站，具有以下特点：
- 用户登录机制（管理员和普通用户）
- 作品上传与密码保护
- 多级归档和子归档功能
- 作品分享链接功能
- 邀请码注册机制
- 用户管理功能（设置昵称、更改密码、注销账号）
- 管理员功能（创建/删除用户、设置邀请码）
- 尖角UI设计风格

## 预设账号
- 管理员账号：lqy
- 管理员密码：lqy2291107

## 本地开发

### 环境要求
- Node.js (v14+)
- MongoDB

### 安装依赖
```bash
npm install
```

### 初始化数据库
```bash
npm run init-db
```
这将创建预设的管理员账号和初始邀请码。

### 启动开发服务器
```bash
npm run dev
```
这将同时启动前端和后端服务器。
- 前端: http://localhost:3000
- 后端: http://localhost:5000

### 构建生产版本
```bash
npm run build
```
构建后的文件将位于 `client/build` 目录中。

## 部署到 GitHub Pages

1. 创建一个新的GitHub仓库
2. 将构建后的文件推送到仓库的gh-pages分支

```bash
cd client/build
git init
git add .
git commit -m "Deploy to GitHub Pages"
git remote add origin https://github.com/yourusername/yourusername.github.io.git
git push -u origin master
```

3. 在GitHub仓库设置中启用GitHub Pages，选择master分支作为源

## 注意事项

- 由于GitHub Pages是静态网站托管，后端API需要单独部署到支持Node.js的服务器上
- 部署后需要更新前端代码中的API地址，指向实际的后端服务器地址
- 确保MongoDB数据库也已正确配置并可从后端服务器访问

## 项目结构
```
portfolio-sharing-website/
├── client/                 # 前端代码
│   ├── public/             # 静态文件
│   ├── src/                # React源代码
│   │   ├── components/     # 组件
│   │   ├── context/        # 上下文
│   │   ├── pages/          # 页面
│   │   ├── styles/         # 样式
│   │   ├── utils/          # 工具函数
│   │   ├── App.js          # 主应用组件
│   │   └── index.js        # 入口文件
│   └── webpack.config.js   # Webpack配置
├── server/                 # 后端代码
│   ├── config/             # 配置文件
│   ├── controllers/        # 控制器
│   ├── middleware/         # 中间件
│   ├── models/             # 数据模型
│   ├── routes/             # 路由
│   ├── uploads/            # 上传文件存储
│   ├── initDb.js           # 数据库初始化
│   └── server.js           # 服务器入口
└── package.json            # 项目配置
```

## 作者
李齐岳 & Manus
