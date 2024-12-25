import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscriptionController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const subscriptionController = new SubscriptionController();

// Protected routes
router.use(authenticate);

// User subscription routes
router.post('/', subscriptionController.createSubscription);
router.get('/my-subscriptions', subscriptionController.getUserSubscriptions);
router.get('/:id', subscriptionController.getSubscription);
router.post('/:id/cancel', subscriptionController.cancelSubscription);
router.post('/:id/renew', subscriptionController.renewSubscription);

// Admin routes
router.use(authorize('admin'));
router.patch('/:id/payment-status', subscriptionController.updatePaymentStatus);

export default router;
