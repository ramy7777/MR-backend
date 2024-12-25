"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const database_1 = require("../config/database");
const User_1 = require("../entities/User");
const errorHandler_1 = require("../middleware/errorHandler");
class UserService {
    constructor() {
        this.initRepository();
    }
    async initRepository() {
        const dataSource = await (0, database_1.getAppDataSource)();
        this.userRepository = dataSource.getRepository(User_1.User);
    }
    async findById(id) {
        await this.initRepository();
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['subscriptions', 'rentals'],
        });
        if (!user) {
            throw new errorHandler_1.AppError(404, 'User not found');
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
    async update(id, data) {
        await this.initRepository();
        const user = await this.findById(id);
        Object.assign(user, data);
        return this.userRepository.save(user);
    }
    async delete(id) {
        await this.initRepository();
        const user = await this.findById(id);
        user.status = 'inactive';
        return this.userRepository.save(user);
    }
    async getUserStats(userId) {
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
exports.UserService = UserService;
//# sourceMappingURL=userService.js.map