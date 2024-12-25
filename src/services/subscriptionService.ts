import { AppDataSource } from '../config/database';
import { Subscription } from '../entities/Subscription';
import { User } from '../entities/User';
import { Device } from '../entities/Device';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class SubscriptionService {
  private subscriptionRepository = AppDataSource.getRepository(Subscription);
  private userRepository = AppDataSource.getRepository(User);
  private deviceRepository = AppDataSource.getRepository(Device);

  async create(userId: string, data: {
    planType: 'daily' | 'weekly' | 'monthly';
    amount: number;
  }) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Check for active subscriptions
    const activeSubscription = await this.subscriptionRepository.findOne({
      where: {
        userId,
        status: 'active',
      },
    });

    if (activeSubscription) {
      throw new AppError(400, 'User already has an active subscription');
    }

    // Start a transaction to handle both subscription and device assignment
    const queryRunner = AppDataSource.createQueryRunner();
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
      const availableDevices = await queryRunner.manager.find(Device, {
        where: { status: 'available' },
        take: maxDevices,
      });

      if (availableDevices.length === 0) {
        throw new AppError(400, 'No available devices found');
      }

      // Assign devices to user
      for (const device of availableDevices) {
        device.status = 'rented';
        device.currentUserId = userId;
        await queryRunner.manager.save(device);

        logger.info('Device assigned to user', {
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
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private getMaxDevices(planType: 'daily' | 'weekly' | 'monthly'): number {
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

  async findById(id: string) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!subscription) {
      throw new AppError(404, 'Subscription not found');
    }
    return subscription;
  }

  async findByUser(userId: string) {
    return this.subscriptionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async updatePaymentStatus(id: string, status: 'paid' | 'failed') {
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

        logger.info('Device released due to payment failure', {
          deviceId: device.id,
          userId: subscription.userId,
          subscriptionId: subscription.id
        });
      }
    }

    return this.subscriptionRepository.save(subscription);
  }

  async cancel(id: string) {
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

      logger.info('Device released due to subscription cancellation', {
        deviceId: device.id,
        userId: subscription.userId,
        subscriptionId: subscription.id
      });
    }

    return this.subscriptionRepository.save(subscription);
  }

  async renewSubscription(id: string) {
    const oldSubscription = await this.findById(id);
    
    if (oldSubscription.status !== 'expired') {
      throw new AppError(400, 'Can only renew expired subscriptions');
    }

    // Start a transaction for renewal and device assignment
    const queryRunner = AppDataSource.createQueryRunner();
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
      const availableDevices = await queryRunner.manager.find(Device, {
        where: { status: 'available' },
        take: maxDevices,
      });

      if (availableDevices.length === 0) {
        throw new AppError(400, 'No available devices found for renewal');
      }

      // Assign devices to user
      for (const device of availableDevices) {
        device.status = 'rented';
        device.currentUserId = oldSubscription.userId;
        await queryRunner.manager.save(device);

        logger.info('Device assigned to user on renewal', {
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
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private calculateEndDate(planType: 'daily' | 'weekly' | 'monthly'): Date {
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
