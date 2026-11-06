const userService = require('../services/userService');

exports.showProfile = async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await userService.getUserById(userId);
        res.render('profile', { user, section: 'info', data: null, currentUser: req.session.user });
    } catch (err) {
        res.status(500).send('服务器错误');
    }
};

exports.getFavorites = async (req, res) => {
    const userId = req.user.id;
    try {
        const favs = await userService.getFavorites(userId);
        res.render('profile', { user: req.session.user, section: 'favorites', data: favs, currentUser: req.session.user });
    } catch (err) {
        res.status(500).send('服务器错误');
    }
};

exports.getLikes = async (req, res) => {
    const userId = req.user.id;
    try {
        const likes = await userService.getLikes(userId);
        res.render('profile', { user: req.session.user, section: 'likes', data: likes, currentUser: req.session.user });
    } catch (err) {
        res.status(500).send('服务器错误');
    }
};

exports.getComments = async (req, res) => {
    const userId = req.user.id;
    try {
        const comments = await userService.getComments(userId);
        res.render('profile', { user: req.session.user, section: 'comments', data: comments, currentUser: req.session.user });
    } catch (err) {
        res.status(500).send('服务器错误');
    }
};

exports.getBorrows = async (req, res) => {
    const userId = req.user.id;
    try {
        const borrows = await userService.getBorrows(userId);
        res.render('profile', { user: req.session.user, section: 'borrows', data: borrows, currentUser: req.session.user });
    } catch (err) {
        res.status(500).send('服务器错误');
    }
};

exports.updateProfile = async (req, res) => {
    // 简单实现，可根据需要扩展
    res.json({ success: true });
};