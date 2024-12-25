"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authService_1 = require("../services/authService");
const authenticate_1 = require("../middleware/authenticate");
const database_1 = require("../config/database");
const User_1 = require("../entities/User");
const Subscription_1 = require("../entities/Subscription");
const Device_1 = require("../entities/Device");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
const authService = new authService_1.AuthService();
// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
    try {
        const dataSource = await (0, database_1.getAppDataSource)();
        const userRepository = dataSource.getRepository(User_1.User);
        const user = await userRepository.findOne({ where: { id: req.user.userId } });
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ status: 'error', message: 'Admin access required' });
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
// Admin routes should be protected
router.use(authenticate_1.authenticate);
router.use(isAdmin);
// Get all devices
router.get('/devices', async (req, res, next) => {
    try {
        const dataSource = await (0, database_1.getAppDataSource)();
        const deviceRepository = dataSource.getRepository(Device_1.Device);
        const devices = await deviceRepository.find({
            order: { createdAt: 'DESC' },
        });
        logger_1.logger.info('Admin fetched all devices', {
            adminId: req.user.userId,
            deviceCount: devices.length
        });
        res.json({
            status: 'success',
            data: { devices }
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching devices', { error });
        next(error);
    }
});
// Add new device
router.post('/devices', async (req, res, next) => {
    try {
        const dataSource = await (0, database_1.getAppDataSource)();
        const deviceRepository = dataSource.getRepository(Device_1.Device);
        const { serialNumber, specifications, status = 'available', condition = 'excellent' } = req.body;
        // Validate required fields
        if (!serialNumber) {
            return res.status(400).json({
                status: 'error',
                message: 'Serial number is required'
            });
        }
        // Check for duplicate serial number
        const existingDevice = await deviceRepository.findOne({
            where: { serialNumber }
        });
        if (existingDevice) {
            return res.status(400).json({
                status: 'error',
                message: 'Device with this serial number already exists'
            });
        }
        const device = deviceRepository.create({
            serialNumber,
            specifications,
            status,
            condition,
            lastMaintenance: null,
            currentUserId: null
        });
        await deviceRepository.save(device);
        logger_1.logger.info('Admin added new device', {
            adminId: req.user.userId,
            deviceId: device.id,
            serialNumber
        });
        res.status(201).json({
            status: 'success',
            data: { device }
        });
    }
    catch (error) {
        logger_1.logger.error('Error adding device', { error });
        next(error);
    }
});
// Update device
router.put('/devices/:id', async (req, res, next) => {
    try {
        const dataSource = await (0, database_1.getAppDataSource)();
        const deviceRepository = dataSource.getRepository(Device_1.Device);
        const { id } = req.params;
        const { serialNumber, specifications, status, condition } = req.body;
        const device = await deviceRepository.findOne({
            where: { id }
        });
        if (!device) {
            return res.status(404).json({
                status: 'error',
                message: 'Device not found'
            });
        }
        // Check for duplicate serial number if it's being changed
        if (serialNumber && serialNumber !== device.serialNumber) {
            const existingDevice = await deviceRepository.findOne({
                where: { serialNumber }
            });
            if (existingDevice) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Device with this serial number already exists'
                });
            }
        }
        Object.assign(device, {
            serialNumber: serialNumber || device.serialNumber,
            specifications: specifications || device.specifications,
            status: status || device.status,
            condition: condition || device.condition
        });
        await deviceRepository.save(device);
        logger_1.logger.info('Admin updated device', {
            adminId: req.user.userId,
            deviceId: id
        });
        res.json({
            status: 'success',
            data: { device }
        });
    }
    catch (error) {
        logger_1.logger.error('Error updating device', { error });
        next(error);
    }
});
// Delete device
router.delete('/devices/:id', async (req, res, next) => {
    try {
        const dataSource = await (0, database_1.getAppDataSource)();
        const deviceRepository = dataSource.getRepository(Device_1.Device);
        const { id } = req.params;
        const device = await deviceRepository.findOne({
            where: { id }
        });
        if (!device) {
            return res.status(404).json({
                status: 'error',
                message: 'Device not found'
            });
        }
        await deviceRepository.remove(device);
        logger_1.logger.info('Admin deleted device', {
            adminId: req.user.userId,
            deviceId: id
        });
        res.json({
            status: 'success',
            message: 'Device deleted successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Error deleting device', { error });
        next(error);
    }
});
// Update device status
router.patch('/devices/:id/status', async (req, res, next) => {
    try {
        const dataSource = await (0, database_1.getAppDataSource)();
        const deviceRepository = dataSource.getRepository(Device_1.Device);
        const { id } = req.params;
        const { status } = req.body;
        const device = await deviceRepository.findOne({ where: { id } });
        if (!device) {
            return res.status(404).json({ status: 'error', message: 'Device not found' });
        }
        device.status = status;
        await deviceRepository.save(device);
        logger_1.logger.info('Admin updated device status', {
            adminId: req.user.userId,
            deviceId: id,
            newStatus: status
        });
        res.json({
            status: 'success',
            data: { device }
        });
    }
    catch (error) {
        logger_1.logger.error('Error updating device status', { error });
        next(error);
    }
});
// Get all subscriptions
router.get('/subscriptions', async (req, res, next) => {
    try {
        const dataSource = await (0, database_1.getAppDataSource)();
        const subscriptionRepository = dataSource.getRepository(Subscription_1.Subscription);
        const subscriptions = await subscriptionRepository.find({
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
        logger_1.logger.info('Admin fetched all subscriptions', {
            adminId: req.user.userId,
            subscriptionCount: subscriptions.length
        });
        res.json({
            status: 'success',
            data: { subscriptions }
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching subscriptions', { error });
        next(error);
    }
});
// Promote user to admin
router.post('/promote-to-admin', authenticate_1.authenticate, async (req, res, next) => {
    try {
        const dataSource = await (0, database_1.getAppDataSource)();
        const userRepository = dataSource.getRepository(User_1.User);
        const user = await userRepository.findOne({ where: { id: req.user.userId } });
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }
        user.role = 'admin';
        await userRepository.save(user);
        logger_1.logger.info('User promoted to admin', { userId: user.id });
        // Generate new tokens with updated role
        const tokens = authService['generateAuthTokens'](user);
        res.json({
            status: 'success',
            data: { user, ...tokens }
        });
    }
    catch (error) {
        logger_1.logger.error('Error promoting user to admin', { error });
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map