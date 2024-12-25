import { Router } from 'express';
import { DeviceController } from '../controllers/deviceController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const deviceController = new DeviceController();

// Protected routes
router.use(authenticate);

// Public device routes
router.get('/', deviceController.getAllDevices);
router.get('/:id', deviceController.getDevice);
router.get('/:id/stats', deviceController.getDeviceStats);

// Admin routes
router.use(authorize('admin'));
router.post('/', deviceController.createDevice);
router.patch('/:id', deviceController.updateDevice);
router.post('/:id/maintenance', deviceController.scheduleMaintenance);

export default router;
