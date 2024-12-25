import express from 'express';
import { AuthService } from '../services/authService';
import { authenticate } from '../middleware/authenticate';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';

const router = express.Router();
const authService = new AuthService();

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

    // Generate new tokens with updated role
    const tokens = authService['generateAuthTokens'](user);

    res.json({
      status: 'success',
      data: { user, ...tokens }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
