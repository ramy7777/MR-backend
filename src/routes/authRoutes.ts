import express from 'express';
import { AuthController } from '../controllers/authController';
import { AuthService } from '../services/authService';
import { authenticate } from '../middleware/authenticate';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';

const router = express.Router();
const authController = new AuthController();
const authService = new AuthService();

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: req.user.userId } });
    
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
