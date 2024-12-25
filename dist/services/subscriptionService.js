"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = void 0;
const database_1 = require("../config/database");
const Subscription_1 = require("../entities/Subscription");
const User_1 = require("../entities/User");
const Device_1 = require("../entities/Device");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
class SubscriptionService {
    constructor() {
        this.initRepositories();
    }
    async initRepositories() {
        const dataSource = await (0, database_1.getAppDataSource)();
        this.subscriptionRepository = dataSource.getRepository(Subscription_1.Subscription);
        this.userRepository = dataSource.getRepository(User_1.User);
        this.deviceRepository = dataSource.getRepository(Device_1.Device);
    }
    async create(userId, data) {
        await this.initRepositories();
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new errorHandler_1.AppError(404, 'User not found');
        }
        // Check for active subscriptions
        const activeSubscription = await this.subscriptionRepository.findOne({
            where: {
                userId,
                status: 'active',
            },
        });
        if (activeSubscription) {
            throw new errorHandler_1.AppError(400, 'User already has an active subscription');
        }
        // Start a transaction to handle both subscription and device assignment
        const dataSource = await (0, database_1.getAppDataSource)();
        const queryRunner = dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Create the subscription
            const subscription = this.subscriptionRepository.create({
                user,
                userId,
                planType: data.planType,
                amount: data.amount,
                startDate: new Date(),
                endDate: this.calculateEndDate(data.planType),
                status: 'active',
                paymentStatus: 'pending',
            });
            await queryRunner.manager.save(subscription);
            // Find available devices based on plan type
            const maxDevices = this.getMaxDevices(data.planType);
            const availableDevices = await queryRunner.manager.find(Device_1.Device, {
                where: { status: 'available' },
                take: maxDevices,
            });
            if (availableDevices.length === 0) {
                throw new errorHandler_1.AppError(400, 'No available devices found');
            }
            // Assign devices to user
            for (const device of availableDevices) {
                device.status = 'rented';
                device.currentUserId = userId;
                await queryRunner.manager.save(device);
                logger_1.logger.info('Device assigned to user', {
                    deviceId: device.id,
                    userId,
                    subscriptionId: subscription.id
                });
            }
            await queryRunner.commitTransaction();
            return {
                subscription,
                assignedDevices: availableDevices
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    getMaxDevices(planType) {
        switch (planType) {
            case 'daily':
                return 1;
            case 'weekly':
                return 3;
            case 'monthly':
                return 999; // Effectively unlimited
            default:
                return 1;
        }
    }
    async findById(id) {
        await this.initRepositories();
        const subscription = await this.subscriptionRepository.findOne({
            where: { id },
            relations: ['user'],
        });
        if (!subscription) {
            throw new errorHandler_1.AppError(404, 'Subscription not found');
        }
        return subscription;
    }
    async findByUser(userId) {
        await this.initRepositories();
        return this.subscriptionRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
    async updatePaymentStatus(id, status) {
        await this.initRepositories();
        const subscription = await this.findById(id);
        const oldStatus = subscription.paymentStatus;
        subscription.paymentStatus = status;
        if (status === 'failed') {
            subscription.status = 'cancelled';
            // Release assigned devices if payment fails
            const devices = await this.deviceRepository.find({
                where: { currentUserId: subscription.userId }
            });
            for (const device of devices) {
                device.status = 'available';
                device.currentUserId = null;
                await this.deviceRepository.save(device);
                logger_1.logger.info('Device released due to payment failure', {
                    deviceId: device.id,
                    userId: subscription.userId,
                    subscriptionId: subscription.id
                });
            }
        }
        return this.subscriptionRepository.save(subscription);
    }
    async cancel(id) {
        await this.initRepositories();
        const subscription = await this.findById(id);
        subscription.status = 'cancelled';
        // Release assigned devices on cancellation
        const devices = await this.deviceRepository.find({
            where: { currentUserId: subscription.userId }
        });
        for (const device of devices) {
            device.status = 'available';
            device.currentUserId = null;
            await this.deviceRepository.save(device);
            logger_1.logger.info('Device released due to subscription cancellation', {
                deviceId: device.id,
                userId: subscription.userId,
                subscriptionId: subscription.id
            });
        }
        return this.subscriptionRepository.save(subscription);
    }
    async renewSubscription(id) {
        await this.initRepositories();
        const oldSubscription = await this.findById(id);
        if (oldSubscription.status !== 'expired') {
            throw new errorHandler_1.AppError(400, 'Can only renew expired subscriptions');
        }
        // Start a transaction for renewal and device assignment
        const dataSource = await (0, database_1.getAppDataSource)();
        const queryRunner = dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const newSubscription = this.subscriptionRepository.create({
                user: oldSubscription.user,
                userId: oldSubscription.userId,
                planType: oldSubscription.planType,
                amount: oldSubscription.amount,
                startDate: new Date(),
                endDate: this.calculateEndDate(oldSubscription.planType),
                status: 'active',
                paymentStatus: 'pending',
            });
            await queryRunner.manager.save(newSubscription);
            // Find and assign new devices
            const maxDevices = this.getMaxDevices(oldSubscription.planType);
            const availableDevices = await queryRunner.manager.find(Device_1.Device, {
                where: { status: 'available' },
                take: maxDevices,
            });
            if (availableDevices.length === 0) {
                throw new errorHandler_1.AppError(400, 'No available devices found for renewal');
            }
            // Assign devices to user
            for (const device of availableDevices) {
                device.status = 'rented';
                device.currentUserId = oldSubscription.userId;
                await queryRunner.manager.save(device);
                logger_1.logger.info('Device assigned to user on renewal', {
                    deviceId: device.id,
                    userId: oldSubscription.userId,
                    subscriptionId: newSubscription.id
                });
            }
            await queryRunner.commitTransaction();
            return {
                subscription: newSubscription,
                assignedDevices: availableDevices
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    calculateEndDate(planType) {
        const now = new Date();
        switch (planType) {
            case 'daily':
                return new Date(now.setDate(now.getDate() + 1));
            case 'weekly':
                return new Date(now.setDate(now.getDate() + 7));
            case 'monthly':
                return new Date(now.setMonth(now.getMonth() + 1));
            default:
                return new Date(now.setDate(now.getDate() + 1));
        }
    }
}
exports.SubscriptionService = SubscriptionService;
//# sourceMappingURL=subscriptionService.js.map