"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceService = void 0;
const database_1 = require("../config/database");
const Device_1 = require("../entities/Device");
const errorHandler_1 = require("../middleware/errorHandler");
class DeviceService {
    constructor() {
        this.initRepository();
    }
    async initRepository() {
        const dataSource = await (0, database_1.getAppDataSource)();
        this.deviceRepository = dataSource.getRepository(Device_1.Device);
    }
    async create(data) {
        await this.initRepository();
        const device = this.deviceRepository.create(data);
        return this.deviceRepository.save(device);
    }
    async findById(id) {
        await this.initRepository();
        const device = await this.deviceRepository.findOne({
            where: { id },
            relations: ['rentals', 'sessions'],
        });
        if (!device) {
            throw new errorHandler_1.AppError(404, 'Device not found');
        }
        return device;
    }
    async findAll(page = 1, limit = 10, status) {
        await this.initRepository();
        const queryBuilder = this.deviceRepository.createQueryBuilder('device');
        if (status) {
            queryBuilder.where('device.status = :status', { status });
        }
        const [devices, total] = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return {
            devices,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async update(id, data) {
        await this.initRepository();
        const device = await this.findById(id);
        Object.assign(device, data);
        return this.deviceRepository.save(device);
    }
    async updateStatus(id, status) {
        await this.initRepository();
        const device = await this.findById(id);
        device.status = status;
        return this.deviceRepository.save(device);
    }
    async getDeviceStats(id) {
        await this.initRepository();
        const device = await this.deviceRepository
            .createQueryBuilder('device')
            .leftJoinAndSelect('device.rentals', 'rental')
            .leftJoinAndSelect('device.sessions', 'session')
            .where('device.id = :id', { id })
            .getOne();
        if (!device) {
            throw new errorHandler_1.AppError(404, 'Device not found');
        }
        const totalUsageHours = device.sessions.reduce((acc, session) => {
            if (session.endTime) {
                const duration = (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60 * 60);
                return acc + duration;
            }
            return acc;
        }, 0);
        return {
            totalRentals: device.rentals.length,
            totalSessions: device.sessions.length,
            totalUsageHours: Math.round(totalUsageHours * 100) / 100,
            currentStatus: device.status,
            lastMaintenance: device.lastMaintenance,
            condition: device.condition,
        };
    }
    async scheduleMaintenanceCheck(id, date) {
        await this.initRepository();
        const device = await this.findById(id);
        device.status = 'maintenance';
        device.lastMaintenance = date;
        return this.deviceRepository.save(device);
    }
}
exports.DeviceService = DeviceService;
//# sourceMappingURL=deviceService.js.map