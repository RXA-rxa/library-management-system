# 图书管理系统

Node.js + Express + SQL Server 做的图书管理系统，带豆瓣爬虫抓图书数据。

## 项目简介

一个完整的图书管理平台，用户可以注册登录后浏览图书、借阅归还、评论、点赞、收藏。管理员可以管理图书和用户数据。另外用 Python 写了个豆瓣爬虫，批量抓图书信息导入数据库，不用手动录数据。

## 技术栈

| 层 | 技术 |
| --- | --- |
| 后端 | Node.js + Express |
| 数据库 | SQL Server |
| 前端 | EJS 模板 + CSS + JavaScript |
| 认证 | JWT + Session |
| 爬虫 | Python + requests + BeautifulSoup |

## 功能模块

### 用户端

- 注册、登录、退出（JWT 认证）
- 首页图书推荐、分类浏览
- 图书详情页
- 借书、还书
- 评论、点赞、收藏图书
- 个人中心查看借阅记录和收藏

### 管理员端

- 图书管理（增删改查）
- 用户管理
- 借阅记录查看和统计

### 数据采集

- Python 爬虫从豆瓣抓图书信息（书名、作者、封面、评分）
- CSV 文件批量导入 SQL Server
- 不用手动一条一条录数据

## 系统架构

```
浏览器 (EJS 页面)
    ↓
Middleware 中间件（登录校验）
    ↓
Routes 路由（URL 映射）
    ↓
Controllers 控制器（处理请求）
    ↓
Services 业务层（借阅逻辑、互动逻辑）
    ↓
Models 数据模型（操作 SQL Server）
```

## 数据库设计

主要数据表：

- **users** — 用户账号（普通用户、管理员）
- **books** — 图书信息（书名、作者、封面、分类、库存）
- **borrow_records** — 借阅记录
- **comments** — 图书评论
- **favorites** — 收藏记录
- **likes** — 点赞记录

## 实现方式

```
# 1. 安装依赖
npm install

# 2. 配置数据库
# 复制 .env.example 为 .env，填入 SQL Server 连接信息

# 3. 导入图书数据（先用爬虫抓数据）
python douban_spider.py
python import_books.py

# 4. 启动
npm start
```

## 目录结构

```
config/         数据库和 JWT 认证配置
controllers/    控制器（用户、图书、借阅、互动、管理员）
middleware/      中间件（登录校验）
models/          数据模型
routes/          路由（按模块拆分）
services/        业务逻辑层
views/           EJS 页面（首页、登录、注册、个人中心、管理员）
public/          静态资源（CSS、JS）
app.js           入口文件
douban_spider.py 豆瓣爬虫脚本
import_books.py   CSV 批量导入脚本
```
