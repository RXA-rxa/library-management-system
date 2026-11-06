const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 注册页面
router.get('/register', (req, res) => res.render('register', { error: null }));
// 登录页面
router.get('/login', (req, res) => res.render('login', { error: null }));

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

module.exports = router;