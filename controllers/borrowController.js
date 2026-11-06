const borrowService = require('../services/borrowService');

exports.borrowBook = async (req, res) => {
    const userId = req.user.id;
    const { bookId } = req.body;
    try {
        await borrowService.borrowBook(userId, bookId);
        res.json({ success: true, message: '借阅成功' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.returnBook = async (req, res) => {
    const userId = req.user.id;
    const { recordId } = req.body;
    try {
        await borrowService.returnBook(recordId, userId);
        res.json({ success: true, message: '归还成功' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.renewBook = async (req, res) => {
    const userId = req.user.id;
    const { recordId } = req.body;
    try {
        await borrowService.renewBook(recordId, userId);
        res.json({ success: true, message: '续借成功' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.reportLost = async (req, res) => {
    const userId = req.user.id;
    const { recordId } = req.body;
    try {
        await borrowService.reportLost(recordId, userId);
        res.json({ success: true, message: '挂失成功' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.getMyRecords = async (req, res) => {
    const userId = req.user.id;
    try {
        const records = await borrowService.getUserRecords(userId);
        res.json(records);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};