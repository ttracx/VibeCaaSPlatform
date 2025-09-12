"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.generateToken = generateToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const logger_1 = require("../utils/logger");
async function authMiddleware(req, res, next) {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User_1.UserModel.findOne({ id: decoded.userId });
        if (!user) {
            return res.status(401).json({ error: 'Invalid token. User not found.' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        logger_1.logger.error('Auth middleware error:', error);
        res.status(401).json({ error: 'Invalid token.' });
    }
}
function generateToken(userId) {
    return jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
}
//# sourceMappingURL=auth.js.map