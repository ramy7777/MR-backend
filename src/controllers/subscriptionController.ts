import { Request, Response, NextFunction } from 'express';
import { SubscriptionService } from '../services/subscriptionService';
import { AppError } from '../middleware/errorHandler';

export class SubscriptionController {
  private subscriptionService = new SubscriptionService();

  createSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(401, 'Not authenticated');

      const { planType, amount } = req.body;
      if (!planType || !amount) {
        throw new AppError(400, 'Plan type and amount are required');
      }

      const subscription = await this.subscriptionService.create(userId, {
        planType,
        amount,
      });

      res.status(201).json({
        status: 'success',
        data: { subscription },
      });
    } catch (error) {
      next(error);
    }
  };

  getUserSubscriptions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError(401, 'Not authenticated');

      const subscriptions = await this.subscriptionService.findByUser(userId);
      res.status(200).json({
        status: 'success',
        data: { subscriptions },
      });
    } catch (error) {
      next(error);
    }
  };

  getSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const subscription = await this.subscriptionService.findById(id);
      res.status(200).json({
        status: 'success',
        data: { subscription },
      });
    } catch (error) {
      next(error);
    }
  };

  cancelSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const subscription = await this.subscriptionService.cancel(id);
      res.status(200).json({
        status: 'success',
        data: { subscription },
      });
    } catch (error) {
      next(error);
    }
  };

  renewSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const subscription = await this.subscriptionService.renewSubscription(id);
      res.status(200).json({
        status: 'success',
        data: { subscription },
      });
    } catch (error) {
      next(error);
    }
  };

  updatePaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['paid', 'failed'].includes(status)) {
        throw new AppError(400, 'Invalid payment status');
      }

      const subscription = await this.subscriptionService.updatePaymentStatus(id, status);
      res.status(200).json({
        status: 'success',
        data: { subscription },
      });
    } catch (error) {
      next(error);
    }
  };
}
