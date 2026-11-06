const bookService = require('../services/bookService');

exports.getBooks = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const keyword = req.query.keyword || '';
    const category = req.query.category || '';
    try {
        const result = await bookService.getBooks(page, limit, keyword, category);
        const stats = await bookService.getStats();
        res.render('index', {
            books: result.books,
            totalBooks: stats.totalBooks,
            borrowingCount: stats.borrowingCount,
            commentCount: stats.commentCount,
            currentPage: page,
            totalPages: result.totalPages,
            keyword,
            category,
            user: req.session.user
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('服务器错误');
    }
};

exports.getBookDetail = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const book = await bookService.getBookById(id);
        const comments = await bookService.getCommentsByBook(id);
        res.render('bookDetail', { book, comments, user: req.session.user });
    } catch (err) {
        console.error(err);
        res.status(500).send('服务器错误');
    }
};