import express from 'express';
import { AuthService } from '../services/authService';
import { authenticate } from '../middleware/authenticate';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Subscription } from '../entities/Subscription';
import { Device } from '../entities/Device'; // Import Device entity
import { logger } from '../utils/logger';

const router = express.Router();
const authService = new AuthService();

// Middleware to check if user is admin
const isAdmin = async (req: any, res: any, next: any) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: req.user.userId } });
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Admin access required' });
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

// Admin routes should be protected
router.use(authenticate);
router.use(isAdmin);

// Get all subscriptions
router.get('/subscriptions', async (req, res, next) => {
  try {
    const subscriptionRepository = AppDataSource.getRepository(Subscription);
    const subscriptions = await subscriptionRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    logger.info('Admin fetched all subscriptions', { 
      adminId: req.user.userId,
      subscriptionCount: subscriptions.length 
    });

    res.json({
      status: 'success',
      data: { subscriptions }
    });
  } catch (error) {
    logger.error('Error fetching subscriptions', { error });
    next(error);
  }
});

// Get all devices for admin
router.get('/devices', async (req, res, next) => {
  try {
    const deviceRepository = AppDataSource.getRepository(Device);
    const devices = await deviceRepository.find({
      order: { createdAt: 'DESC' },
    });

    logger.info('Admin fetched all devices', { 
      adminId: req.user.userId,
      deviceCount: devices.length 
    });

    res.json({
      status: 'success',
      data: { devices }
    });
  } catch (error) {
    logger.error('Error fetching devices', { error });
    next(error);
  }
});

// Update device status
router.patch('/devices/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const deviceRepository = AppDataSource.getRepository(Device);
    const device = await deviceRepository.findOne({ where: { id } });
    
    if (!device) {
      return res.status(404).json({ status: 'error', message: 'Device not found' });
    }

    device.status = status;
    await deviceRepository.save(device);

    logger.info('Admin updated device status', { 
      adminId: req.user.userId,
      deviceId: id,
      newStatus: status
    });

    res.json({
      status: 'success',
      data: { device }
    });
  } catch (error) {
    logger.error('Error updating device status', { error });
    next(error);
  }
});

// Delete device
router.delete('/devices/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const deviceRepository = AppDataSource.getRepository(Device);
    const device = await deviceRepository.findOne({ where: { id } });
    
    if (!device) {
      return res.status(404).json({ status: 'error', message: 'Device not found' });
    }

    await deviceRepository.remove(device);

    logger.info('Admin deleted device', { 
      adminId: req.user.userId,
      deviceId: id
    });

    res.json({
      status: 'success',
      message: 'Device deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting device', { error });
    next(error);
  }
});

// Promote user to admin
router.post('/promote-to-admin', authenticate, async (req, res, next) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: req.user.userId } });
    
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    user.role = 'admin';
    await userRepository.save(user);

    logger.info('User promoted to admin', { userId: user.id });

    // Generate new tokens with updated role
    const tokens = authService['generateAuthTokens'](user);

    res.json({
      status: 'success',
      data: { user, ...tokens }
    });
  } catch (error) {
    logger.error('Error promoting user to admin', { error });
    next(error);
  }
});

export default router;
