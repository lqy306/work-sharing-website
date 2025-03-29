const express = require('express');
const router = express.Router();
const shareController = require('../controllers/shareController');
const auth = require('../middleware/auth');

// 创建或更新作品分享链接
router.post('/works/:id/share', auth.auth, shareController.createShareLink);

// 获取分享作品
router.get('/share/:shareLink', shareController.getSharedWork);

module.exports = router;
