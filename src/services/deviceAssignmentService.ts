import { AppDataSource } from '../config/database';
import { Device } from '../entities/Device';
import { Subscription } from '../entities/Subscription';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class DeviceAssignmentService {
  private deviceRepository = AppDataSource.getRepository(Device);
  private subscriptionRepository = AppDataSource.getRepository(Subscription);

  async assignDeviceToSubscription(deviceId: string, subscriptionId: string) {
    const device = await this.deviceRepository.findOne({ 
      where: { id: deviceId },
      relations: ['currentSubscription']
    });
    
    if (!device) {
      throw new AppError(404, 'Device not found');
    }

    if (device.status !== 'available') {
      throw new AppError(400, `Device is not available (current status: ${device.status})`);
    }

    const subscription = await this.subscriptionRepository.findOne({
      where: { id: subscriptionId },
      relations: ['devices']
    });

    if (!subscription) {
      throw new AppError(404, 'Subscription not found');
    }

    if (subscription.status !== 'active') {
      throw new AppError(400, 'Subscription is not active');
    }

    if (subscription.currentDeviceCount >= subscription.maxDevices) {
      throw new AppError(400, `Maximum device limit (${subscription.maxDevices}) reached for this subscription`);
    }

    // Update device
    device.status = 'rented';
    device.currentUserId = subscription.userId;
    device.currentSubscriptionId = subscriptionId;

    // Update subscription
    subscription.currentDeviceCount += 1;

    // Save both entities
    await this.deviceRepository.save(device);
    await this.subscriptionRepository.save(subscription);

    logger.info('Device assigned to subscription', {
      deviceId,
      subscriptionId,
      userId: subscription.userId
    });

    return device;
  }

  async unassignDevice(deviceId: string) {
    const device = await this.deviceRepository.findOne({
      where: { id: deviceId },
      relations: ['currentSubscription']
    });

    if (!device) {
      throw new AppError(404, 'Device not found');
    }

    if (device.status !== 'rented') {
      throw new AppError(400, 'Device is not currently rented');
    }

    const subscription = device.currentSubscription;
    if (!subscription) {
      throw new AppError(500, 'Device has no associated subscription');
    }

    // Update device
    device.status = 'available';
    device.currentUserId = null;
    device.currentSubscriptionId = null;

    // Update subscription
    subscription.currentDeviceCount = Math.max(0, subscription.currentDeviceCount - 1);

    // Save both entities
    await this.deviceRepository.save(device);
    await this.subscriptionRepository.save(subscription);

    logger.info('Device unassigned from subscription', {
      deviceId,
      subscriptionId: subscription.id,
      userId: subscription.userId
    });

    return device;
  }

  async getAvailableDevices() {
    return this.deviceRepository.find({
      where: { status: 'available' },
      order: { createdAt: 'DESC' }
    });
  }

  async getUserDevices(userId: string) {
    return this.deviceRepository.find({
      where: { currentUserId: userId },
      relations: ['currentSubscription'],
      order: { createdAt: 'DESC' }
    });
  }
}
