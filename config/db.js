const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST || 'localhost',
    database: process.env.DB_DATABASE || 'library_db',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

let pool = null;

async function getConnection() {
    if (pool) return pool;
    try {
        pool = await sql.connect(config);
        console.log('✅ 数据库连接成功');
        return pool;
    } catch (err) {
        console.error('❌ 数据库连接失败:', err);
        throw err;
    }
}

module.exports = { getConnection, sql };