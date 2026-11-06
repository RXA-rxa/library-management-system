const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 视图引擎
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout'); // 指定布局文件
app.set('views', path.join(__dirname, 'views'));

// 中间件
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// ---------- 修复点：确保 session secret 存在 ----------
app.use(session({
    secret: process.env.JWT_SECRET || 'default_secret_key_please_change',  // 使用环境变量或默认值
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // 本地开发设为 false
}));

// 挂载路由
app.use('/auth', require('./routes/auth'));
app.use('/books', require('./routes/books'));
app.use('/interact', require('./routes/interact'));
app.use('/borrow', require('./routes/borrow'));
app.use('/user', require('./routes/user'));
app.use('/admin', require('./routes/admin'));

// 首页重定向
app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/books');
    } else {
        res.redirect('/auth/login');
    }
});

app.listen(PORT, () => {
    console.log(`🚀 服务已启动: http://localhost:${PORT}`);
});