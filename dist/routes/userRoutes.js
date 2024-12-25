"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const userController = new userController_1.UserController();
// Protected routes
router.use(auth_1.authenticate);
// User routes
router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);
router.get('/stats', userController.getUserStats);
// Admin routes
router.use((0, auth_1.authorize)('admin'));
router.get('/', userController.getAllUsers);
router.delete('/:id', userController.deleteUser);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map