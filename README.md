# 图书管理系统

Node.js + Express + SQL Server 做的图书管理系统，带豆瓣爬虫抓图书数据。

## 技术栈

- 后端：Node.js + Express
- 数据库：SQL Server
- 前端：EJS 模板 + CSS + JavaScript
- 认证：JWT + Session
- 爬虫：Python 豆瓣爬虫

## 功能

### 用户端
- 注册、登录、退出（JWT 认证）
- 图书浏览、详情页
- 借书、还书
- 评论、点赞、收藏图书
- 个人中心查看借阅记录

### 管理员端
- 图书管理（增删改查）
- 用户管理
- 借阅记录查看

### 数据来源
- 用 Python 爬虫从豆瓣抓图书数据
- CSV 文件批量导入数据库

## 怎么跑

```
# 安装依赖
npm install

# 配置数据库（复制 .env.example 为 .env，填入 SQL Server 配置）

# 导入图书数据（可选）
python import_books.py

# 启动
npm start
```

## 目录结构

```
config/         数据库和认证配置
controllers/    控制器（处理请求）
middleware/      中间件（登录校验）
models/          数据模型
routes/          路由
services/        业务逻辑
views/           EJS 页面
public/          静态资源（CSS、JS）
app.js           入口文件
```
