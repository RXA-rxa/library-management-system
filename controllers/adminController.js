const adminService = require('../services/adminService');

exports.dashboard = async (req, res) => {
    // 默认展示图书管理
    res.redirect('/admin/books');
};

exports.getBooks = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 100;
    try {
        const result = await adminService.getBooks(page, limit);
        res.render('admin', {
            section: 'books',
            books: result.books,
            booksTotal: result.total,
            users: [],
            borrowStats: {},
            comments: [],
            payments: [],
            user: req.session.user
        });
    } catch (err) {
        res.status(500).send('服务器错误');
    }
};

exports.addBook = async (req, res) => {
    const { title, author, category, price, stock, description } = req.body;
    try {
        await adminService.addBook({ title, author, category, price, stock, description });
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.updateBook = async (req, res) => {
    const id = parseInt(req.params.id);
    const { title, author, category, price, stock, description } = req.body;
    try {
        await adminService.updateBook(id, { title, author, category, price, stock, description });
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.deleteBook = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        await adminService.deleteBook(id);
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await adminService.getUsers();
        res.render('admin', {
            section: 'users',
            users: users,
            books: [],
            borrowStats: {},
            comments: [],
            payments: [],
            user: req.session.user
        });
    } catch (err) {
        res.status(500).send('服务器错误');
    }
};

exports.deleteUser = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        await adminService.deleteUser(id);
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.getBorrowStats = async (req, res) => {
    try {
        const stats = await adminService.getBorrowStats();
        const recent = await adminService.getRecentBorrows();
        res.render('admin', {
            section: 'borrows',
            borrowStats: { ...stats, recentRecords: recent },
            books: [],
            users: [],
            comments: [],
            payments: [],
            user: req.session.user
        });
    } catch (err) {
        res.status(500).send('服务器错误');
    }
};

exports.getComments = async (req, res) => {
    try {
        const comments = await adminService.getComments();
        res.render('admin', {
            section: 'comments',
            comments: comments,
            books: [],
            users: [],
            borrowStats: {},
            payments: [],
            user: req.session.user
        });
    } catch (err) {
        res.status(500).send('服务器错误');
    }
};

exports.deleteComment = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        await adminService.deleteComment(id);
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.getPayments = async (req, res) => {
    try {
        const payments = await adminService.getPayments();
        res.render('admin', {
            section: 'payments',
            payments: payments,
            books: [],
            users: [],
            borrowStats: {},
            comments: [],
            user: req.session.user
        });
    } catch (err) {
        res.status(500).send('服务器错误');
    }
};

exports.addPayment = async (req, res) => {
    const { name, description, status } = req.body;
    try {
        await adminService.addPayment({ name, description, status });
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.updatePayment = async (req, res) => {
    const id = parseInt(req.params.id);
    const { name, description, status } = req.body;
    try {
        await adminService.updatePayment(id, { name, description, status });
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.deletePayment = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        await adminService.deletePayment(id);
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};