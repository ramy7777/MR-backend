import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Rental } from '../entities/Rental';
import { Device } from '../entities/Device';
import { User } from '../entities/User';
import { AppError } from '../middleware/errorHandler';
import { TokenPayload } from '../utils/jwt';
import { logger } from '../utils/logger';

interface AuthRequest extends Request {
  user?: TokenPayload;
}

export class RentalController {
  private rentalRepository = AppDataSource.getRepository(Rental);
  private deviceRepository = AppDataSource.getRepository(Device);
  private userRepository = AppDataSource.getRepository(User);

  async getAllRentals(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized');
      }

      const userId = req.user.id;
      const { status, deviceType } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const queryBuilder = this.rentalRepository
        .createQueryBuilder('rental')
        .leftJoinAndSelect('rental.device', 'device')
        .where('rental.userId = :userId', { userId });

      if (status) {
        queryBuilder.andWhere('rental.status = :status', { status });
      }
      if (deviceType) {
        queryBuilder.andWhere('device.type = :deviceType', { deviceType });
      }

      const [rentals, total] = await queryBuilder
        .orderBy('rental.startDate', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      logger.info('Retrieved user rentals:', {
        userId,
        filters: { status, deviceType },
        count: rentals.length
      });

      res.json({
        status: 'success',
        data: {
          rentals: rentals.map(rental => ({
            id: rental.id,
            deviceId: rental.deviceId,
            deviceName: rental.device.name,
            deviceType: rental.device.type,
            startDate: rental.startDate,
            endDate: rental.endDate,
            status: rental.status,
            rentalFee: rental.rentalFee,
            location: rental.device.location
          })),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      logger.error('Error retrieving rentals:', error);
      throw error;
    }
  }

  async getRental(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized');
      }

      const rental = await this.rentalRepository.findOne({
        where: { id: req.params.id },
        relations: ['device']
      });

      if (!rental) {
        throw new AppError(404, 'Rental not found');
      }

      if (rental.userId !== req.user.id && req.user.role !== 'admin') {
        throw new AppError(403, 'Forbidden');
      }

      logger.info('Retrieved rental details:', { rentalId: rental.id });

      res.json({
        status: 'success',
        data: {
          rental: {
            id: rental.id,
            deviceId: rental.deviceId,
            deviceName: rental.device.name,
            deviceType: rental.device.type,
            startDate: rental.startDate,
            endDate: rental.endDate,
            status: rental.status,
            rentalFee: rental.rentalFee,
            location: rental.device.location,
            notes: rental.notes
          }
        }
      });
    } catch (error) {
      logger.error('Error retrieving rental:', error);
      throw error;
    }
  }

  async createRental(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized');
      }

      const { deviceId, startDate, endDate, notes } = req.body;

      if (!deviceId || !startDate || !endDate) {
        throw new AppError(400, 'Missing required fields');
      }

      const device = await this.deviceRepository.findOne({
        where: { id: deviceId }
      });

      if (!device) {
        throw new AppError(404, 'Device not found');
      }

      if (device.status === 'rented' || device.status === 'maintenance') {
        throw new AppError(400, 'Device is not available for rental');
      }

      // Calculate rental fee based on duration and device type
      const start = new Date(startDate);
      const end = new Date(endDate);
      const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      
      const hourlyRates = {
        'vr': 10,
        'ar': 15,
        'mixed': 20
      };
      
      const rentalFee = Math.round(durationHours * (hourlyRates[device.type] || 10) * 100) / 100;

      const rental = this.rentalRepository.create({
        userId: req.user.id,
        deviceId,
        startDate: start,
        endDate: end,
        status: 'pending',
        rentalFee,
        notes
      });

      await this.rentalRepository.save(rental);

      // Update device status
      device.status = 'rented';
      device.currentUserId = req.user.id;
      await this.deviceRepository.save(device);

      logger.info('Created new rental:', {
        rentalId: rental.id,
        userId: req.user.id,
        deviceId
      });

      res.status(201).json({
        status: 'success',
        data: {
          rental: {
            id: rental.id,
            deviceId: rental.deviceId,
            startDate: rental.startDate,
            endDate: rental.endDate,
            status: rental.status,
            rentalFee: rental.rentalFee,
            notes: rental.notes
          }
        }
      });
    } catch (error) {
      logger.error('Error creating rental:', error);
      throw error;
    }
  }

  async updateRental(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized');
      }

      const rental = await this.rentalRepository.findOne({
        where: { id: req.params.id },
        relations: ['device']
      });

      if (!rental) {
        throw new AppError(404, 'Rental not found');
      }

      if (rental.userId !== req.user.id && req.user.role !== 'admin') {
        throw new AppError(403, 'Forbidden');
      }

      const { status, endDate, notes } = req.body;

      if (status) {
        rental.status = status;
        
        // Update device status when rental is completed or cancelled
        if (status === 'completed' || status === 'cancelled') {
          const device = await this.deviceRepository.findOne({
            where: { id: rental.deviceId }
          });
          if (device) {
            device.status = 'available';
            device.currentUserId = null;
            await this.deviceRepository.save(device);
          }
        }
      }

      if (endDate) {
        const newEndDate = new Date(endDate);
        if (newEndDate > rental.startDate) {
          rental.endDate = newEndDate;
          
          // Recalculate rental fee
          const durationHours = (newEndDate.getTime() - rental.startDate.getTime()) / (1000 * 60 * 60);
          const hourlyRates = {
            'vr': 10,
            'ar': 15,
            'mixed': 20
          };
          rental.rentalFee = Math.round(durationHours * (hourlyRates[rental.device.type] || 10) * 100) / 100;
        }
      }

      if (notes) {
        rental.notes = notes;
      }

      await this.rentalRepository.save(rental);

      logger.info('Updated rental:', {
        rentalId: rental.id,
        updatedFields: { status, endDate, notes }
      });

      res.json({
        status: 'success',
        data: {
          rental: {
            id: rental.id,
            deviceId: rental.deviceId,
            startDate: rental.startDate,
            endDate: rental.endDate,
            status: rental.status,
            rentalFee: rental.rentalFee,
            notes: rental.notes
          }
        }
      });
    } catch (error) {
      logger.error('Error updating rental:', error);
      throw error;
    }
  }

  async deleteRental(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Unauthorized');
      }

      const rental = await this.rentalRepository.findOne({
        where: { id: req.params.id }
      });

      if (!rental) {
        throw new AppError(404, 'Rental not found');
      }

      if (rental.userId !== req.user.id && req.user.role !== 'admin') {
        throw new AppError(403, 'Forbidden');
      }

      if (rental.status === 'active') {
        throw new AppError(400, 'Cannot delete an active rental');
      }

      await this.rentalRepository.remove(rental);

      logger.info('Deleted rental:', { rentalId: rental.id });

      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting rental:', error);
      throw error;
    }
  }
}
