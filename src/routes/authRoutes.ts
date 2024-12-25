import express from 'express';
import { AuthController } from '../controllers/authController';
import { AuthService } from '../services/authService';
import { authenticate } from '../middleware/authenticate';
import { getAppDataSource } from '../config/database';
import { User } from '../entities/User';
import { logger } from '../utils/logger';

const router = express.Router();
const authController = new AuthController();
const authService = new AuthService();

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/me', authenticate, async (req, res, next) => {
  try {
    logger.info('Getting user info', { userId: req.user.userId });
    const dataSource = await getAppDataSource();
    const userRepository = dataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: req.user.userId } });
    
    if (!user) {
      logger.error('User not found', { userId: req.user.userId });
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    logger.info('User info retrieved', { user: { id: user.id, email: user.email, role: user.role } });
    res.json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    logger.error('Error getting user info', { error });
    next(error);
  }
});

export default router;
