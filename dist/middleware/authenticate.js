"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("./errorHandler");
const logger_1 = require("../utils/logger");
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            logger_1.logger.warn('No token provided');
            throw new errorHandler_1.AppError(401, 'No token provided');
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            logger_1.logger.warn('Invalid token format');
            throw new errorHandler_1.AppError(401, 'Invalid token format');
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        logger_1.logger.info('Token decoded successfully', { decoded });
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            logger_1.logger.error('Invalid token', { error });
            next(new errorHandler_1.AppError(401, 'Invalid token'));
        }
        else {
            logger_1.logger.error('Authentication error', { error });
            next(error);
        }
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=authenticate.js.map