"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../config/database");
const User_1 = require("../entities/User");
const errorHandler_1 = require("../middleware/errorHandler");
const jwt_1 = require("../utils/jwt");
const logger_1 = require("../utils/logger");
class AuthService {
    constructor() {
        this.userRepository = database_1.AppDataSource.getRepository(User_1.User);
    }
    async register(email, password, name) {
        const existingUser = await this.userRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new errorHandler_1.AppError(400, 'Email already registered');
        }
        // Check if this is the first user
        const userCount = await this.userRepository.count();
        const isFirstUser = userCount === 0;
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = this.userRepository.create({
            email,
            passwordHash,
            name,
            status: 'active',
            role: isFirstUser ? 'admin' : 'user' // First user gets admin role
        });
        await this.userRepository.save(user);
        logger_1.logger.info('User registered:', { id: user.id, email: user.email, role: user.role });
        const tokens = this.generateAuthTokens(user);
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            ...tokens
        };
    }
    async login(email, password) {
        logger_1.logger.info('Login attempt:', { email });
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            logger_1.logger.warn('Login failed - user not found:', { email });
            throw new errorHandler_1.AppError(401, 'Invalid credentials');
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isValidPassword) {
            logger_1.logger.warn('Login failed - invalid password:', { email });
            throw new errorHandler_1.AppError(401, 'Invalid credentials');
        }
        logger_1.logger.info('User logged in successfully:', { id: user.id, email: user.email, role: user.role });
        const tokens = this.generateAuthTokens(user);
        // Log the generated tokens and user data
        logger_1.logger.info('Generated tokens and user data:', {
            userId: user.id,
            userEmail: user.email,
            userRole: user.role,
            tokenPayload: {
                userId: user.id,
                email: user.email,
                role: user.role
            }
        });
        // Return a clean user object with only the necessary fields
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            ...tokens
        };
    }
    generateAuthTokens(user) {
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role
        };
        logger_1.logger.info('Generating tokens with payload:', payload);
        return {
            accessToken: (0, jwt_1.generateToken)(payload),
            refreshToken: (0, jwt_1.generateRefreshToken)(payload)
        };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=authService.js.map