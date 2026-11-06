const { getConnection, sql } = require('../config/db');

exports.getBooks = async (page, limit) => {
    const pool = await getConnection();
    const offset = (page - 1) * limit;
    const countResult = await pool.request().query('SELECT COUNT(*) as total FROM Books');
    const total = countResult.recordset[0].total;
    const result = await pool.request()
        .query(`SELECT * FROM Books ORDER BY id OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`);
    return { books: result.recordset, total };
};

exports.addBook = async ({ title, author, category, price, stock, description }) => {
    const pool = await getConnection();
    await pool.request()
        .input('title', sql.NVarChar, title)
        .input('author', sql.NVarChar, author || null)
        .input('category', sql.NVarChar, category || null)
        .input('price', sql.Decimal, price || 0)
        .input('stock', sql.Int, stock || 0)
        .input('description', sql.NVarChar, description || null)
        .query(`INSERT INTO Books (title, author, category, price, stock, description)
                VALUES (@title, @author, @category, @price, @stock, @description)`);
};

exports.updateBook = async (id, { title, author, category, price, stock, description }) => {
    const pool = await getConnection();
    await pool.request()
        .input('id', sql.Int, id)
        .input('title', sql.NVarChar, title)
        .input('author', sql.NVarChar, author || null)
        .input('category', sql.NVarChar, category || null)
        .input('price', sql.Decimal, price || 0)
        .input('stock', sql.Int, stock || 0)
        .input('description', sql.NVarChar, description || null)
        .query(`UPDATE Books SET title=@title, author=@author, category=@category,
                price=@price, stock=@stock, description=@description WHERE id=@id`);
};

exports.deleteBook = async (id) => {
    const pool = await getConnection();
    await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM Books WHERE id = @id');
};

exports.getUsers = async () => {
    const pool = await getConnection();
    const result = await pool.request()
        .query('SELECT id, username, realname, type, role, email, phone FROM Users');
    return result.recordset;
};

exports.deleteUser = async (id) => {
    const pool = await getConnection();
    await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM Users WHERE id = @id');
};

exports.getBorrowStats = async () => {
    const pool = await getConnection();
    const total = await pool.request().query("SELECT COUNT(*) as c FROM Borrows");
    const borrowing = await pool.request().query("SELECT COUNT(*) as c FROM Borrows WHERE status='BORROWED'");
    const overdue = await pool.request().query("SELECT COUNT(*) as c FROM Borrows WHERE status='OVERDUE'");
    const returned = await pool.request().query("SELECT COUNT(*) as c FROM Borrows WHERE status='RETURNED'");
    return {
        totalBorrows: total.recordset[0].c,
        borrowing: borrowing.recordset[0].c,
        overdue: overdue.recordset[0].c,
        returned: returned.recordset[0].c
    };
};

exports.getRecentBorrows = async () => {
    const pool = await getConnection();
    const result = await pool.request()
        .query(`SELECT TOP 10 b.*, bk.title as bookTitle, u.username
                FROM Borrows b
                JOIN Books bk ON b.book_id = bk.id
                JOIN Users u ON b.user_id = u.id
                ORDER BY b.borrow_time DESC`);
    return result.recordset;
};

exports.getComments = async () => {
    const pool = await getConnection();
    const result = await pool.request()
        .query(`SELECT c.*, u.username, bk.title as bookTitle
                FROM Comments c
                JOIN Users u ON c.user_id = u.id
                JOIN Books bk ON c.book_id = bk.id
                ORDER BY c.create_time DESC`);
    return result.recordset;
};

exports.deleteComment = async (id) => {
    const pool = await getConnection();
    await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM Comments WHERE id = @id');
};

exports.getPayments = async () => {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM Payments ORDER BY id');
    return result.recordset;
};

exports.addPayment = async ({ name, description, status }) => {
    const pool = await getConnection();
    await pool.request()
        .input('name', sql.NVarChar, name)
        .input('description', sql.NVarChar, description || null)
        .input('status', sql.NVarChar, status || 'ACTIVE')
        .query(`INSERT INTO Payments (name, description, status) VALUES (@name, @description, @status)`);
};

exports.updatePayment = async (id, { name, description, status }) => {
    const pool = await getConnection();
    await pool.request()
        .input('id', sql.Int, id)
        .input('name', sql.NVarChar, name)
        .input('description', sql.NVarChar, description || null)
        .input('status', sql.NVarChar, status || 'ACTIVE')
        .query(`UPDATE Payments SET name=@name, description=@description, status=@status WHERE id=@id`);
};

exports.deletePayment = async (id) => {
    const pool = await getConnection();
    await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM Payments WHERE id = @id');
};