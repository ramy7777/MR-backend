import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';

const router = Router();
const dashboardController = new DashboardController();

// User dashboard route
router.get('/user', authenticate, dashboardController.getUserDashboard.bind(dashboardController));

// Admin dashboard route
router.get('/admin', authenticate, dashboardController.getAdminDashboard.bind(dashboardController));

export default router;
