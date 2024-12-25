import { AppDataSource } from '../config/database';
import { Subscription } from '../entities/Subscription';
import { User } from '../entities/User';
import { AppError } from '../middleware/errorHandler';

export class SubscriptionService {
  private subscriptionRepository = AppDataSource.getRepository(Subscription);
  private userRepository = AppDataSource.getRepository(User);

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

    return this.subscriptionRepository.save(subscription);
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
    subscription.paymentStatus = status;
    
    if (status === 'failed') {
      subscription.status = 'cancelled';
    }

    return this.subscriptionRepository.save(subscription);
  }

  async cancel(id: string) {
    const subscription = await this.findById(id);
    subscription.status = 'cancelled';
    return this.subscriptionRepository.save(subscription);
  }

  async renewSubscription(id: string) {
    const oldSubscription = await this.findById(id);
    
    if (oldSubscription.status !== 'expired') {
      throw new AppError(400, 'Can only renew expired subscriptions');
    }

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

    return this.subscriptionRepository.save(newSubscription);
  }

  private calculateEndDate(planType: 'daily' | 'weekly' | 'monthly'): Date {
    const endDate = new Date();
    switch (planType) {
      case 'daily':
        endDate.setDate(endDate.getDate() + 1);
        break;
      case 'weekly':
        endDate.setDate(endDate.getDate() + 7);
        break;
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
    }
    return endDate;
  }
}
