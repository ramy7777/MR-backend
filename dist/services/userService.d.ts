import { User } from '../entities/User';
export declare class UserService {
    private userRepository;
    constructor();
    private initRepository;
    findById(id: string): Promise<User>;
    findAll(page?: number, limit?: number): Promise<{
        users: User[];
        pagination: {
            total: number;
            page: number;
            pages: number;
        };
    }>;
    update(id: string, data: Partial<User>): Promise<User>;
    delete(id: string): Promise<User>;
    getUserStats(userId: string): Promise<{
        activeSubscriptions: number;
        totalRentals: number;
        totalSessions: number;
        accountStatus: "active" | "inactive" | "suspended";
    }>;
}
