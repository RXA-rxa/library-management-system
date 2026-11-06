const { getConnection, sql } = require('../config/db');

exports.getBooks = async (page, limit, keyword, category) => {
    const pool = await getConnection();
    const offset = (page - 1) * limit;
    let query = `SELECT * FROM Books WHERE 1=1`;
    const params = [];
    if (keyword) {
        query += ` AND (title LIKE @keyword OR author LIKE @keyword)`;
        params.push({ name: 'keyword', type: sql.NVarChar, value: `%${keyword}%` });
    }
    if (category) {
        query += ` AND category = @category`;
        params.push({ name: 'category', type: sql.NVarChar, value: category });
    }
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    let request = pool.request();
    params.forEach(p => request.input(p.name, p.type, p.value));
    const countResult = await request.query(countQuery);
    const total = countResult.recordset[0].total;

    query += ` ORDER BY id OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
    request = pool.request();
    params.forEach(p => request.input(p.name, p.type, p.value));
    const result = await request.query(query);
    return {
        books: result.recordset,
        totalPages: Math.ceil(total / limit),
        total
    };
};

exports.getStats = async () => {
    const pool = await getConnection();
    const totalBooks = await pool.request().query('SELECT COUNT(*) as c FROM Books');
    const borrowing = await pool.request().query("SELECT COUNT(*) as c FROM Borrows WHERE status='BORROWED'");
    const comments = await pool.request().query('SELECT COUNT(*) as c FROM Comments');
    return {
        totalBooks: totalBooks.recordset[0].c,
        borrowingCount: borrowing.recordset[0].c,
        commentCount: comments.recordset[0].c
    };
};

exports.getBookById = async (id) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM Books WHERE id = @id');
    if (result.recordset.length === 0) throw new Error('图书不存在');
    return result.recordset[0];
};

exports.getCommentsByBook = async (bookId) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('bookId', sql.Int, bookId)
        .query(`SELECT c.*, u.username FROM Comments c
                JOIN Users u ON c.user_id = u.id
                WHERE c.book_id = @bookId
                ORDER BY c.create_time DESC`);
    return result.recordset;
};