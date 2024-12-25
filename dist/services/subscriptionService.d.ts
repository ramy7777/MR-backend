import { Subscription } from '../entities/Subscription';
import { Device } from '../entities/Device';
export declare class SubscriptionService {
    private subscriptionRepository;
    private userRepository;
    private deviceRepository;
    constructor();
    private initRepositories;
    create(userId: string, data: {
        planType: 'daily' | 'weekly' | 'monthly';
        amount: number;
    }): Promise<{
        subscription: Subscription;
        assignedDevices: Device[];
    }>;
    private getMaxDevices;
    findById(id: string): Promise<Subscription>;
    findByUser(userId: string): Promise<Subscription[]>;
    updatePaymentStatus(id: string, status: 'paid' | 'failed'): Promise<Subscription>;
    cancel(id: string): Promise<Subscription>;
    renewSubscription(id: string): Promise<{
        subscription: Subscription;
        assignedDevices: Device[];
    }>;
    private calculateEndDate;
}
