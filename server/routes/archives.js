const express = require('express');
const router = express.Router();
const archiveController = require('../controllers/archiveController');
const auth = require('../middleware/auth');

// 创建归档
router.post('/', auth.auth, archiveController.createArchive);

// 获取当前用户的归档列表
router.get('/', auth.auth, archiveController.getArchives);

// 获取归档树
router.get('/tree', auth.auth, archiveController.getArchiveTree);

// 获取单个归档
router.get('/:id', auth.auth, archiveController.getArchive);

// 更新归档
router.put('/:id', auth.auth, archiveController.updateArchive);

// 删除归档
router.delete('/:id', auth.auth, archiveController.deleteArchive);

module.exports = router;
