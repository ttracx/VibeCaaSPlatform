"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const joi_1 = __importDefault(require("joi"));
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const uuid_1 = require("uuid");
const router = express_1.default.Router();
const registerSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(50).required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required()
});
const loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required()
});
router.post('/register', async (req, res, next) => {
    try {
        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const { name, email, password } = value;
        const existingUser = await User_1.UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }
        const user = new User_1.UserModel({
            id: (0, uuid_1.v4)(),
            name,
            email,
            password,
            plan: 'free'
        });
        await user.save();
        const token = (0, auth_1.generateToken)(user.id);
        logger_1.logger.info(`New user registered: ${email}`);
        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                plan: user.plan,
                createdAt: user.createdAt
            }
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/login', async (req, res, next) => {
    try {
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const { email, password } = value;
        const user = await User_1.UserModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        user.lastLoginAt = new Date();
        await user.save();
        const token = (0, auth_1.generateToken)(user.id);
        logger_1.logger.info(`User logged in: ${email}`);
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                plan: user.plan,
                lastLoginAt: user.lastLoginAt
            }
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/profile', async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User_1.UserModel.findOne({ id: decoded.userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            plan: user.plan,
            avatar: user.avatar,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/logout', (req, res) => {
    res.json({ message: 'Logout successful' });
});
exports.default = router;
//# sourceMappingURL=auth.js.map