"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const authService_1 = require("../services/authService");
const authenticate_1 = require("../middleware/authenticate");
const database_1 = require("../config/database");
const User_1 = require("../entities/User");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
const authController = new authController_1.AuthController();
const authService = new authService_1.AuthService();
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticate_1.authenticate, async (req, res, next) => {
    try {
        logger_1.logger.info('Getting user info', { userId: req.user.userId });
        const dataSource = await (0, database_1.getAppDataSource)();
        const userRepository = dataSource.getRepository(User_1.User);
        const user = await userRepository.findOne({ where: { id: req.user.userId } });
        if (!user) {
            logger_1.logger.error('User not found', { userId: req.user.userId });
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }
        logger_1.logger.info('User info retrieved', { user: { id: user.id, email: user.email, role: user.role } });
        res.json({
            status: 'success',
            data: { user }
        });
    }
    catch (error) {
        logger_1.logger.error('Error getting user info', { error });
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=authRoutes.js.map