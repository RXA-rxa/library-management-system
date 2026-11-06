const { getConnection, sql } = require('../config/db');

exports.borrowBook = async (userId, bookId) => {
    const pool = await getConnection();
    // 检查库存
    const book = await pool.request()
        .input('id', sql.Int, bookId)
        .query('SELECT stock FROM Books WHERE id = @id');
    if (book.recordset.length === 0) throw new Error('图书不存在');
    if (book.recordset[0].stock <= 0) throw new Error('库存不足');
    // 检查用户是否已借阅且未归还
    const existing = await pool.request()
        .input('userId', sql.Int, userId)
        .input('bookId', sql.Int, bookId)
        .query("SELECT id FROM Borrows WHERE user_id = @userId AND book_id = @bookId AND status='BORROWED'");
    if (existing.recordset.length > 0) throw new Error('您已借阅该书，请先归还');
    // 减库存
    await pool.request()
        .input('id', sql.Int, bookId)
        .query('UPDATE Books SET stock = stock - 1 WHERE id = @id');
    // 添加借阅记录
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 借阅期限30天
    await pool.request()
        .input('userId', sql.Int, userId)
        .input('bookId', sql.Int, bookId)
        .input('dueTime', sql.DateTime, dueDate)
        .query(`INSERT INTO Borrows (user_id, book_id, due_time) VALUES (@userId, @bookId, @dueTime)`);
};

exports.returnBook = async (recordId, userId) => {
    const pool = await getConnection();
    // 验证记录属于该用户
    const record = await pool.request()
        .input('id', sql.Int, recordId)
        .input('userId', sql.Int, userId)
        .query("SELECT book_id FROM Borrows WHERE id = @id AND user_id = @userId AND status='BORROWED'");
    if (record.recordset.length === 0) throw new Error('借阅记录不存在或已归还');
    const bookId = record.recordset[0].book_id;
    // 更新归还时间
    await pool.request()
        .input('id', sql.Int, recordId)
        .query("UPDATE Borrows SET return_time = GETDATE(), status='RETURNED' WHERE id = @id");
    // 增加库存
    await pool.request()
        .input('id', sql.Int, bookId)
        .query('UPDATE Books SET stock = stock + 1 WHERE id = @id');
};

exports.renewBook = async (recordId, userId) => {
    const pool = await getConnection();
    const record = await pool.request()
        .input('id', sql.Int, recordId)
        .input('userId', sql.Int, userId)
        .query("SELECT due_time FROM Borrows WHERE id = @id AND user_id = @userId AND status='BORROWED'");
    if (record.recordset.length === 0) throw new Error('借阅记录不存在或已归还');
    // 续借30天
    const newDue = new Date(record.recordset[0].due_time);
    newDue.setDate(newDue.getDate() + 30);
    await pool.request()
        .input('id', sql.Int, recordId)
        .input('newDue', sql.DateTime, newDue)
        .query('UPDATE Borrows SET due_time = @newDue WHERE id = @id');
};

exports.reportLost = async (recordId, userId) => {
    const pool = await getConnection();
    const record = await pool.request()
        .input('id', sql.Int, recordId)
        .input('userId', sql.Int, userId)
        .query("SELECT book_id FROM Borrows WHERE id = @id AND user_id = @userId AND status='BORROWED'");
    if (record.recordset.length === 0) throw new Error('借阅记录不存在或已归还');
    const bookId = record.recordset[0].book_id;
    // 标记为挂失（视为已归还，但库存不增加，可额外处理）
    await pool.request()
        .input('id', sql.Int, recordId)
        .query("UPDATE Borrows SET return_time = GETDATE(), status='LOST' WHERE id = @id");
    // 库存不减（图书已丢失，不增加库存）
};

exports.getUserRecords = async (userId) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`SELECT b.*, bk.title as bookTitle FROM Borrows b
                JOIN Books bk ON b.book_id = bk.id
                WHERE b.user_id = @userId
                ORDER BY b.borrow_time DESC`);
    return result.recordset;
};