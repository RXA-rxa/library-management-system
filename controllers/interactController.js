const interactService = require('../services/interactService');

exports.toggleLike = async (req, res) => {
    const userId = req.user.id;
    const { bookId } = req.body;
    try {
        const result = await interactService.toggleLike(userId, bookId);
        res.json({ success: true, liked: result.liked, count: result.count });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.toggleFav = async (req, res) => {
    const userId = req.user.id;
    const { bookId } = req.body;
    try {
        const result = await interactService.toggleFav(userId, bookId);
        res.json({ success: true, faved: result.faved, count: result.count });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.addComment = async (req, res) => {
    const userId = req.user.id;
    const { bookId, content } = req.body;
    try {
        await interactService.addComment(userId, bookId, content);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getComments = async (req, res) => {
    const bookId = parseInt(req.params.bookId);
    try {
        const comments = await interactService.getComments(bookId);
        res.json(comments);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};