const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// 获取用户列表（仅管理员可用）
router.get('/', auth.auth, auth.admin, userController.getUsers);

// 获取单个用户信息
router.get('/:id', auth.auth, userController.getUser);

// 更新用户信息
router.put('/:id', auth.auth, userController.updateUser);

// 更新用户密码
router.put('/:id/password', auth.auth, userController.updatePassword);

// 删除用户
router.delete('/:id', auth.auth, userController.deleteUser);

// 创建用户（仅管理员可用）
router.post('/', auth.auth, auth.admin, userController.createUser);

// 获取邀请码列表（仅管理员可用）
router.get('/invite-codes', auth.auth, auth.admin, userController.getInviteCodes);

// 创建邀请码（仅管理员可用）
router.post('/invite-codes', auth.auth, auth.admin, userController.createInviteCode);

// 删除邀请码（仅管理员可用）
router.delete('/invite-codes/:id', auth.auth, auth.admin, userController.deleteInviteCode);

module.exports = router;
