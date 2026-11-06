const { getConnection, sql } = require('../config/db');

exports.getUserById = async (id) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT id, username, realname, type, role, email, phone FROM Users WHERE id = @id');
    if (result.recordset.length === 0) throw new Error('用户不存在');
    return result.recordset[0];
};

exports.getFavorites = async (userId) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`SELECT b.* FROM Favorites f JOIN Books b ON f.book_id = b.id WHERE f.user_id = @userId`);
    return result.recordset;
};

exports.getLikes = async (userId) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`SELECT b.* FROM Likes l JOIN Books b ON l.book_id = b.id WHERE l.user_id = @userId`);
    return result.recordset;
};

exports.getComments = async (userId) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`SELECT c.*, b.title as bookTitle FROM Comments c JOIN Books b ON c.book_id = b.id WHERE c.user_id = @userId ORDER BY c.create_time DESC`);
    return result.recordset;
};

exports.getBorrows = async (userId) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`SELECT b.*, bk.title as bookTitle FROM Borrows b JOIN Books bk ON b.book_id = bk.id WHERE b.user_id = @userId ORDER BY b.borrow_time DESC`);
    return result.recordset;
};