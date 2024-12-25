import { getAppDataSource } from '../config/database';
import { Device } from '../entities/Device';
import { AppError } from '../middleware/errorHandler';
import { Repository } from 'typeorm';

export class DeviceService {
  private deviceRepository: Repository<Device>;

  constructor() {
    this.initRepository();
  }

  private async initRepository() {
    const dataSource = await getAppDataSource();
    this.deviceRepository = dataSource.getRepository(Device);
  }

  async create(data: Partial<Device>) {
    await this.initRepository();
    const device = this.deviceRepository.create(data);
    return this.deviceRepository.save(device);
  }

  async findById(id: string) {
    await this.initRepository();
    const device = await this.deviceRepository.findOne({
      where: { id },
      relations: ['rentals', 'sessions'],
    });
    if (!device) {
      throw new AppError(404, 'Device not found');
    }
    return device;
  }

  async findAll(page = 1, limit = 10, status?: Device['status']) {
    await this.initRepository();
    const queryBuilder = this.deviceRepository.createQueryBuilder('device');

    if (status) {
      queryBuilder.where('device.status = :status', { status });
    }

    const [devices, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      devices,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, data: Partial<Device>) {
    await this.initRepository();
    const device = await this.findById(id);
    Object.assign(device, data);
    return this.deviceRepository.save(device);
  }

  async updateStatus(id: string, status: Device['status']) {
    await this.initRepository();
    const device = await this.findById(id);
    device.status = status;
    return this.deviceRepository.save(device);
  }

  async getDeviceStats(id: string) {
    await this.initRepository();
    const device = await this.deviceRepository
      .createQueryBuilder('device')
      .leftJoinAndSelect('device.rentals', 'rental')
      .leftJoinAndSelect('device.sessions', 'session')
      .where('device.id = :id', { id })
      .getOne();

    if (!device) {
      throw new AppError(404, 'Device not found');
    }

    const totalUsageHours = device.sessions.reduce((acc, session) => {
      if (session.endTime) {
        const duration = (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60 * 60);
        return acc + duration;
      }
      return acc;
    }, 0);

    return {
      totalRentals: device.rentals.length,
      totalSessions: device.sessions.length,
      totalUsageHours: Math.round(totalUsageHours * 100) / 100,
      currentStatus: device.status,
      lastMaintenance: device.lastMaintenance,
      condition: device.condition,
    };
  }

  async scheduleMaintenanceCheck(id: string, date: Date) {
    await this.initRepository();
    const device = await this.findById(id);
    device.status = 'maintenance';
    device.lastMaintenance = date;
    return this.deviceRepository.save(device);
  }
}
