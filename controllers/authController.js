const bcrypt = require('bcryptjs');
const { getConnection, sql } = require('../config/db');
const { generateToken } = require('../config/auth');

exports.showLogin = (req, res) => {
    res.render('login', { error: null, user: req.session.user });
};

exports.showRegister = (req, res) => {
    res.render('register', { error: null, user: req.session.user });
};

exports.register = async (req, res) => {
    const { username, password, realname, type } = req.body;
    try {
        const pool = await getConnection();
        const check = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT id FROM Users WHERE username = @username');
        if (check.recordset.length > 0) {
            return res.render('register', { error: '用户名已存在', user: req.session.user });
        }
        const hashed = await bcrypt.hash(password, 10);
        await pool.request()
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, hashed)
            .input('realname', sql.NVarChar, realname)
            .input('type', sql.NVarChar, type || 'STUDENT')
            .query(`INSERT INTO Users (username, password, realname, type)
                    VALUES (@username, @password, @realname, @type)`);
        res.redirect('/auth/login?registered=true');
    } catch (err) {
        console.error(err);
        res.render('register', { error: '注册失败，请稍后重试', user: req.session.user });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT * FROM Users WHERE username = @username');
        const user = result.recordset[0];
        if (!user) {
            return res.render('login', { error: '用户名或密码错误', user: req.session.user });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.render('login', { error: '用户名或密码错误', user: req.session.user });
        }
        const token = generateToken({
            id: user.id,
            username: user.username,
            role: user.role,
            type: user.type
        });
        req.session.token = token;
        req.session.user = { id: user.id, username: user.username, role: user.role, type: user.type };
        res.redirect('/books');
    } catch (err) {
        console.error(err);
        res.render('login', { error: '登录失败', user: req.session.user });
    }
};

exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
};