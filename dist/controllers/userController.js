"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const userService_1 = require("../services/userService");
const errorHandler_1 = require("../middleware/errorHandler");
class UserController {
    constructor() {
        this.userService = new userService_1.UserService();
        this.getProfile = async (req, res, next) => {
            try {
                const userId = req.user?.userId;
                if (!userId)
                    throw new errorHandler_1.AppError(401, 'Not authenticated');
                const user = await this.userService.findById(userId);
                res.status(200).json({
                    status: 'success',
                    data: { user },
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateProfile = async (req, res, next) => {
            try {
                const userId = req.user?.userId;
                if (!userId)
                    throw new errorHandler_1.AppError(401, 'Not authenticated');
                const updatedUser = await this.userService.update(userId, req.body);
                res.status(200).json({
                    status: 'success',
                    data: { user: updatedUser },
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getUserStats = async (req, res, next) => {
            try {
                const userId = req.user?.userId;
                if (!userId)
                    throw new errorHandler_1.AppError(401, 'Not authenticated');
                const stats = await this.userService.getUserStats(userId);
                res.status(200).json({
                    status: 'success',
                    data: { stats },
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Admin endpoints
        this.getAllUsers = async (req, res, next) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const result = await this.userService.findAll(page, limit);
                res.status(200).json({
                    status: 'success',
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteUser = async (req, res, next) => {
            try {
                const { id } = req.params;
                await this.userService.delete(id);
                res.status(204).send();
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.UserController = UserController;
//# sourceMappingURL=userController.js.map