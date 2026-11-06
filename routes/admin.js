const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// 所有管理路由都需要 ADMIN 权限
router.use(authenticate, authorize('ADMIN'));

router.get('/', adminController.dashboard);
// 图书管理
router.get('/books', adminController.getBooks);
router.post('/books', adminController.addBook);
router.put('/books/:id', adminController.updateBook);
router.delete('/books/:id', adminController.deleteBook);
// 用户管理
router.get('/users', adminController.getUsers);
router.delete('/users/:id', adminController.deleteUser);
// 借阅统计
router.get('/borrow-stats', adminController.getBorrowStats);
// 评论管理
router.get('/comments', adminController.getComments);
router.delete('/comments/:id', adminController.deleteComment);
// 收款码管理
router.get('/payments', adminController.getPayments);
router.post('/payments', adminController.addPayment);
router.put('/payments/:id', adminController.updatePayment);
router.delete('/payments/:id', adminController.deletePayment);

module.exports = router;