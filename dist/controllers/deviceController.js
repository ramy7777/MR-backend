"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceController = void 0;
const deviceService_1 = require("../services/deviceService");
const errorHandler_1 = require("../middleware/errorHandler");
class DeviceController {
    constructor() {
        this.deviceService = new deviceService_1.DeviceService();
        this.createDevice = async (req, res, next) => {
            try {
                const device = await this.deviceService.create(req.body);
                res.status(201).json({
                    status: 'success',
                    data: { device },
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getDevice = async (req, res, next) => {
            try {
                const { id } = req.params;
                const device = await this.deviceService.findById(id);
                res.status(200).json({
                    status: 'success',
                    data: { device },
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getAllDevices = async (req, res, next) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const status = req.query.status;
                const result = await this.deviceService.findAll(page, limit, status);
                res.status(200).json({
                    status: 'success',
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateDevice = async (req, res, next) => {
            try {
                const { id } = req.params;
                const device = await this.deviceService.update(id, req.body);
                res.status(200).json({
                    status: 'success',
                    data: { device },
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getDeviceStats = async (req, res, next) => {
            try {
                const { id } = req.params;
                const stats = await this.deviceService.getDeviceStats(id);
                res.status(200).json({
                    status: 'success',
                    data: { stats },
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.scheduleMaintenance = async (req, res, next) => {
            try {
                const { id } = req.params;
                const { date } = req.body;
                if (!date) {
                    throw new errorHandler_1.AppError(400, 'Maintenance date is required');
                }
                const device = await this.deviceService.scheduleMaintenanceCheck(id, new Date(date));
                res.status(200).json({
                    status: 'success',
                    data: { device },
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.DeviceController = DeviceController;
//# sourceMappingURL=deviceController.js.map