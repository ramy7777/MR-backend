import { User } from './User';
export declare class Subscription {
    id: string;
    user: User;
    userId: string;
    planType: 'daily' | 'weekly' | 'monthly';
    startDate: Date;
    endDate: Date;
    status: 'active' | 'expired' | 'cancelled';
    paymentStatus: 'pending' | 'paid' | 'failed';
    amount: number;
    createdAt: Date;
    updatedAt: Date;
}
