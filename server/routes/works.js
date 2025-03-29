const express = require('express');
const router = express.Router();
const workController = require('../controllers/workController');
const auth = require('../middleware/auth');

// 上传作品
router.post('/', auth.auth, workController.uploadWork);

// 获取当前用户的作品列表
router.get('/', auth.auth, workController.getWorks);

// 获取单个作品
router.get('/:id', auth.auth, workController.getWork);

// 通过分享链接获取作品
router.get('/share/:shareLink', workController.getWorkByShareLink);

// 验证作品密码
router.post('/:id/verify-password', workController.verifyWorkPassword);

// 更新作品
router.put('/:id', auth.auth, workController.updateWork);

// 删除作品
router.delete('/:id', auth.auth, workController.deleteWork);

module.exports = router;
