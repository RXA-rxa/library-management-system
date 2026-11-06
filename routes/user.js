const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

router.get('/profile', authenticate, userController.showProfile);
router.get('/favorites', authenticate, userController.getFavorites);
router.get('/likes', authenticate, userController.getLikes);
router.get('/comments', authenticate, userController.getComments);
router.get('/borrows', authenticate, userController.getBorrows);
// 更新个人信息（可选）
router.put('/update', authenticate, userController.updateProfile);

module.exports = router;