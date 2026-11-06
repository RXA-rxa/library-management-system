const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.JWT_SECRET;
const expiresIn = '7d';

function generateToken(user) {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role, type: user.type },
        secret,
        { expiresIn }
    );
}

function verifyToken(token) {
    try {
        return jwt.verify(token, secret);
    } catch (e) {
        return null;
    }
}

module.exports = { generateToken, verifyToken };