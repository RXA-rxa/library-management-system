const { verifyToken } = require('../config/auth');

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: '未提供认证令牌' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ message: '无效或过期的令牌' });
    }
    req.user = decoded;
    next();
}

function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ message: '未认证' });
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: '权限不足' });
        }
        next();
    };
}

module.exports = { authenticate, authorize };