import { Request, Response, NextFunction } from 'express';
import { DeviceService } from '../services/deviceService';
import { AppError } from '../middleware/errorHandler';

export class DeviceController {
  private deviceService = new DeviceService();

  createDevice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const device = await this.deviceService.create(req.body);
      res.status(201).json({
        status: 'success',
        data: { device },
      });
    } catch (error) {
      next(error);
    }
  };

  getDevice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const device = await this.deviceService.findById(id);
      res.status(200).json({
        status: 'success',
        data: { device },
      });
    } catch (error) {
      next(error);
    }
  };

  getAllDevices = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;

      const result = await this.deviceService.findAll(page, limit, status as any);
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  updateDevice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const device = await this.deviceService.update(id, req.body);
      res.status(200).json({
        status: 'success',
        data: { device },
      });
    } catch (error) {
      next(error);
    }
  };

  getDeviceStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const stats = await this.deviceService.getDeviceStats(id);
      res.status(200).json({
        status: 'success',
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  };

  scheduleMaintenance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { date } = req.body;

      if (!date) {
        throw new AppError(400, 'Maintenance date is required');
      }

      const device = await this.deviceService.scheduleMaintenanceCheck(id, new Date(date));
      res.status(200).json({
        status: 'success',
        data: { device },
      });
    } catch (error) {
      next(error);
    }
  };
}
