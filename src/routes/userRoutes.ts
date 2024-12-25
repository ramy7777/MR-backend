import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const userController = new UserController();

// Protected routes
router.use(authenticate);

// User routes
router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);
router.get('/stats', userController.getUserStats);

// Admin routes
router.use(authorize('admin'));
router.get('/', userController.getAllUsers);
router.delete('/:id', userController.deleteUser);

export default router;
