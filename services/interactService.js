const { getConnection, sql } = require('../config/db');

exports.toggleLike = async (userId, bookId) => {
    const pool = await getConnection();
    // 检查是否已点赞
    const exist = await pool.request()
        .input('userId', sql.Int, userId)
        .input('bookId', sql.Int, bookId)
        .query('SELECT id FROM Likes WHERE user_id = @userId AND book_id = @bookId');
    if (exist.recordset.length > 0) {
        // 取消点赞
        await pool.request()
            .input('userId', sql.Int, userId)
            .input('bookId', sql.Int, bookId)
            .query('DELETE FROM Likes WHERE user_id = @userId AND book_id = @bookId');
        await pool.request()
            .input('bookId', sql.Int, bookId)
            .query('UPDATE Books SET like_count = like_count - 1 WHERE id = @bookId');
        const count = await pool.request()
            .input('bookId', sql.Int, bookId)
            .query('SELECT like_count FROM Books WHERE id = @bookId');
        return { liked: false, count: count.recordset[0].like_count };
    } else {
        await pool.request()
            .input('userId', sql.Int, userId)
            .input('bookId', sql.Int, bookId)
            .query('INSERT INTO Likes (user_id, book_id) VALUES (@userId, @bookId)');
        await pool.request()
            .input('bookId', sql.Int, bookId)
            .query('UPDATE Books SET like_count = like_count + 1 WHERE id = @bookId');
        const count = await pool.request()
            .input('bookId', sql.Int, bookId)
            .query('SELECT like_count FROM Books WHERE id = @bookId');
        return { liked: true, count: count.recordset[0].like_count };
    }
};

exports.toggleFav = async (userId, bookId) => {
    const pool = await getConnection();
    const exist = await pool.request()
        .input('userId', sql.Int, userId)
        .input('bookId', sql.Int, bookId)
        .query('SELECT id FROM Favorites WHERE user_id = @userId AND book_id = @bookId');
    if (exist.recordset.length > 0) {
        await pool.request()
            .input('userId', sql.Int, userId)
            .input('bookId', sql.Int, bookId)
            .query('DELETE FROM Favorites WHERE user_id = @userId AND book_id = @bookId');
        await pool.request()
            .input('bookId', sql.Int, bookId)
            .query('UPDATE Books SET fav_count = fav_count - 1 WHERE id = @bookId');
        const count = await pool.request()
            .input('bookId', sql.Int, bookId)
            .query('SELECT fav_count FROM Books WHERE id = @bookId');
        return { faved: false, count: count.recordset[0].fav_count };
    } else {
        await pool.request()
            .input('userId', sql.Int, userId)
            .input('bookId', sql.Int, bookId)
            .query('INSERT INTO Favorites (user_id, book_id) VALUES (@userId, @bookId)');
        await pool.request()
            .input('bookId', sql.Int, bookId)
            .query('UPDATE Books SET fav_count = fav_count + 1 WHERE id = @bookId');
        const count = await pool.request()
            .input('bookId', sql.Int, bookId)
            .query('SELECT fav_count FROM Books WHERE id = @bookId');
        return { faved: true, count: count.recordset[0].fav_count };
    }
};

exports.addComment = async (userId, bookId, content) => {
    const pool = await getConnection();
    await pool.request()
        .input('userId', sql.Int, userId)
        .input('bookId', sql.Int, bookId)
        .input('content', sql.NVarChar, content)
        .query('INSERT INTO Comments (user_id, book_id, content) VALUES (@userId, @bookId, @content)');
};

exports.getComments = async (bookId) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('bookId', sql.Int, bookId)
        .query(`SELECT c.*, u.username FROM Comments c
                JOIN Users u ON c.user_id = u.id
                WHERE c.book_id = @bookId
                ORDER BY c.create_time DESC`);
    return result.recordset;
};