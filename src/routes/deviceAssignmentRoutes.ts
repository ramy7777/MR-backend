import { Router } from 'express';
import { DeviceAssignmentController } from '../controllers/deviceAssignmentController';
import { authenticate } from '../middleware/auth';

const router = Router();
const deviceAssignmentController = new DeviceAssignmentController();

// Get available devices (both admin and users can access)
router.get(
  '/available',
  authenticate,
  deviceAssignmentController.getAvailableDevices
);

// Get user's devices
router.get(
  '/user',
  authenticate,
  deviceAssignmentController.getUserDevices
);

// Assign device to subscription
router.post(
  '/assign',
  authenticate,
  deviceAssignmentController.assignDevice
);

// Unassign device
router.post(
  '/unassign/:deviceId',
  authenticate,
  deviceAssignmentController.unassignDevice
);

export default router;
