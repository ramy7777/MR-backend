import { Request, Response, NextFunction } from 'express';
import { DeviceAssignmentService } from '../services/deviceAssignmentService';
import { logger } from '../utils/logger';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export class DeviceAssignmentController {
  private deviceAssignmentService = new DeviceAssignmentService();

  assignDevice = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { deviceId, subscriptionId } = req.body;

      // Verify user has access to this subscription
      if (req.user?.role !== 'admin') {
        // Add subscription ownership verification here
      }

      const device = await this.deviceAssignmentService.assignDeviceToSubscription(
        deviceId,
        subscriptionId
      );

      res.status(200).json({
        status: 'success',
        data: { device }
      });
    } catch (error) {
      next(error);
    }
  };

  unassignDevice = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { deviceId } = req.params;

      const device = await this.deviceAssignmentService.unassignDevice(deviceId);

      res.status(200).json({
        status: 'success',
        data: { device }
      });
    } catch (error) {
      next(error);
    }
  };

  getAvailableDevices = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const devices = await this.deviceAssignmentService.getAvailableDevices();

      res.status(200).json({
        status: 'success',
        data: { devices }
      });
    } catch (error) {
      next(error);
    }
  };

  getUserDevices = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new Error('User ID not found in request');
      }

      const devices = await this.deviceAssignmentService.getUserDevices(userId);

      res.status(200).json({
        status: 'success',
        data: { devices }
      });
    } catch (error) {
      next(error);
    }
  };
}
