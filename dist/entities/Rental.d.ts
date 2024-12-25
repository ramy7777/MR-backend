import { User } from './User';
import { Device } from './Device';
export declare class Rental {
    id: string;
    user: User;
    userId: string;
    device: Device;
    deviceId: string;
    startDate: Date;
    endDate: Date;
    depositAmount: number;
    status: 'pending' | 'active' | 'returned' | 'overdue';
    returnCondition: {
        status: 'undamaged' | 'damaged' | 'lost';
        notes?: string;
        damageDetails?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
