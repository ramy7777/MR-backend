import { getAppDataSource } from '../config/database';
import { User } from '../entities/User';
import { AppError } from '../middleware/errorHandler';
import { Repository } from 'typeorm';

export class UserService {
  private userRepository: Repository<User>;

  constructor() {
    this.initRepository();
  }

  private async initRepository() {
    const dataSource = await getAppDataSource();
    this.userRepository = dataSource.getRepository(User);
  }

  async findById(id: string) {
    await this.initRepository();
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['subscriptions', 'rentals'],
    });
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    return user;
  }

  async findAll(page = 1, limit = 10) {
    await this.initRepository();
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['subscriptions', 'rentals'],
      order: { createdAt: 'DESC' },
    });

    return {
      users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, data: Partial<User>) {
    await this.initRepository();
    const user = await this.findById(id);
    Object.assign(user, data);
    return this.userRepository.save(user);
  }

  async delete(id: string) {
    await this.initRepository();
    const user = await this.findById(id);
    user.status = 'inactive';
    return this.userRepository.save(user);
  }

  async getUserStats(userId: string) {
    await this.initRepository();
    const user = await this.findById(userId);
    const stats = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.subscriptions', 'subscription')
      .leftJoinAndSelect('user.rentals', 'rental')
      .leftJoinAndSelect('user.sessions', 'session')
      .where('user.id = :userId', { userId })
      .getOne();

    return {
      activeSubscriptions: stats?.subscriptions.filter(s => s.status === 'active').length || 0,
      totalRentals: stats?.rentals.length || 0,
      totalSessions: stats?.sessions.length || 0,
      accountStatus: user.status,
    };
  }
}
