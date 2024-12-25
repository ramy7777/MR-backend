"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
const errorHandler_1 = require("../middleware/errorHandler");
class AuthController {
    constructor() {
        this.authService = new authService_1.AuthService();
        this.register = async (req, res, next) => {
            try {
                const { email, password, name } = req.body;
                if (!email || !password || !name) {
                    throw new errorHandler_1.AppError(400, 'Missing required fields');
                }
                const result = await this.authService.register(email, password, name);
                res.status(201).json({
                    status: 'success',
                    data: {
                        user: {
                            id: result.user.id,
                            email: result.user.email,
                            name: result.user.name,
                            role: result.user.role,
                        },
                        accessToken: result.accessToken,
                        refreshToken: result.refreshToken,
                    },
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.login = async (req, res, next) => {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    throw new errorHandler_1.AppError(400, 'Missing required fields');
                }
                const result = await this.authService.login(email, password);
                res.status(200).json({
                    status: 'success',
                    data: {
                        user: {
                            id: result.user.id,
                            email: result.user.email,
                            name: result.user.name,
                            role: result.user.role,
                        },
                        accessToken: result.accessToken,
                        refreshToken: result.refreshToken,
                    },
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=authController.js.map