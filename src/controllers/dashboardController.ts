import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Device } from '../entities/Device';
import { Subscription } from '../entities/Subscription';
import { Session } from '../entities/Session';
import { AppError } from '../middleware/errorHandler';
import { TokenPayload } from '../utils/jwt';
import { logger } from '../utils/logger';

interface AuthRequest extends Request {
  user?: TokenPayload;
}

export class DashboardController {
  async getUserDashboard(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized');
      }
      const userId = req.user.id;

      // Get user's subscription
      const subscriptionRepo = AppDataSource.getRepository(Subscription);
      const subscription = await subscriptionRepo.findOne({
        where: { userId },
        order: { createdAt: 'DESC' }
      });

      // Get user's devices
      const deviceRepo = AppDataSource.getRepository(Device);
      const devices = await deviceRepo.find({ where: { currentUserId: userId } });
      const activeDevices = devices.filter(device => device.status === 'rented');

      // Get user's sessions
      const sessionRepo = AppDataSource.getRepository(Session);
      const sessions = await sessionRepo.find({
        where: { userId },
        order: { startTime: 'DESC' },
        take: 5 // Get only last 5 sessions
      });

      // Calculate total hours from sessions
      const totalHours = sessions.reduce((acc, session) => {
        if (session.endTime) {
          const duration = new Date(session.endTime).getTime() - new Date(session.startTime).getTime();
          return acc + (duration / (1000 * 60 * 60)); // Convert to hours
        }
        return acc;
      }, 0);

      // Format response data
      const dashboardData = {
        subscription: subscription ? {
          id: subscription.id,
          plan: subscription.plan,
          status: subscription.status,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          features: subscription.features
        } : null,
        devices: {
          total: devices.length,
          active: activeDevices.length,
          list: activeDevices.map(device => ({
            id: device.id,
            name: device.name,
            type: device.type,
            status: device.status,
            location: device.location,
            lastActive: device.lastActive
          }))
        },
        sessions: {
          recent: sessions.map(session => ({
            id: session.id,
            deviceId: session.deviceId,
            startTime: session.startTime,
            endTime: session.endTime,
            duration: session.endTime ? 
              (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / (1000 * 60 * 60) : 
              null
          })),
          totalHours: Math.round(totalHours * 100) / 100
        }
      };

      logger.info('Dashboard data retrieved for user:', { userId });

      res.json({
        status: 'success',
        data: dashboardData
      });
    } catch (error) {
      logger.error('Error retrieving dashboard data:', error);
      throw error;
    }
  }

  async getAdminDashboard(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized');
      }
      if (req.user.role !== 'admin') {
        throw new AppError(403, 'Forbidden');
      }

      // Get system stats
      const userRepo = AppDataSource.getRepository(User);
      const deviceRepo = AppDataSource.getRepository(Device);
      const sessionRepo = AppDataSource.getRepository(Session);
      const subscriptionRepo = AppDataSource.getRepository(Subscription);

      // Get total users and recent signups
      const [users, totalUsers] = await userRepo.findAndCount({
        order: { createdAt: 'DESC' },
        take: 5
      });

      // Get device stats
      const [devices, totalDevices] = await deviceRepo.findAndCount();
      const activeDevices = devices.filter(device => device.status === 'rented').length;

      // Get active sessions
      const activeSessions = await sessionRepo.count({
        where: { endTime: null }
      });

      // Get subscription stats
      const activeSubscriptions = await subscriptionRepo.count({
        where: { status: 'active' }
      });

      // Calculate revenue (example calculation)
      const subscriptions = await subscriptionRepo.find({
        where: { status: 'active' }
      });
      const monthlyRevenue = subscriptions.reduce((acc, sub) => {
        const planPrices = {
          'basic': 29.99,
          'premium': 49.99,
          'enterprise': 99.99
        };
        return acc + (planPrices[sub.plan] || 0);
      }, 0);

      // Format admin dashboard data
      const adminDashboardData = {
        users: {
          total: totalUsers,
          recent: users.map(user => ({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt
          }))
        },
        devices: {
          total: totalDevices,
          active: activeDevices,
          utilization: totalDevices > 0 ? (activeDevices / totalDevices * 100).toFixed(1) : '0'
        },
        sessions: {
          active: activeSessions
        },
        subscriptions: {
          active: activeSubscriptions,
          monthlyRevenue: Math.round(monthlyRevenue * 100) / 100
        }
      };

      logger.info('Admin dashboard data retrieved');

      res.json({
        status: 'success',
        data: adminDashboardData
      });
    } catch (error) {
      logger.error('Error retrieving admin dashboard data:', error);
      throw error;
    }
  }

  async getUserDevices(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized');
      }
      const userId = req.user.id;

      const deviceRepo = AppDataSource.getRepository(Device);
      const devices = await deviceRepo.find({ where: { currentUserId: userId } });

      logger.info('User devices retrieved:', { userId, deviceCount: devices.length });

      res.json({
        status: 'success',
        data: { devices }
      });
    } catch (error) {
      logger.error('Error getting user devices:', error);
      throw error;
    }
  }

  async getUserSubscription(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized');
      }
      const userId = req.user.id;

      const subscriptionRepo = AppDataSource.getRepository(Subscription);
      const subscription = await subscriptionRepo.findOne({
        where: { userId },
        order: { createdAt: 'DESC' }
      });

      logger.info('User subscription retrieved:', { userId, hasSubscription: !!subscription });

      res.json({
        status: 'success',
        data: { subscription }
      });
    } catch (error) {
      logger.error('Error getting user subscription:', error);
      throw error;
    }
  }

  async getUserSessions(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized');
      }
      const userId = req.user.id;

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const sessionRepo = AppDataSource.getRepository(Session);
      const [sessions, total] = await sessionRepo.findAndCount({
        where: { userId },
        order: { startTime: 'DESC' },
        skip,
        take: limit
      });

      logger.info('User sessions retrieved:', { userId, sessionCount: sessions.length });

      res.json({
        status: 'success',
        data: {
          sessions,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      logger.error('Error getting user sessions:', error);
      throw error;
    }
  }
}
