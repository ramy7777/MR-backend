import { AppDataSource } from '../config/database';
import { Subscription } from '../entities/Subscription';
import { User } from '../entities/User';

describe('Subscription Entity', () => {
    beforeAll(async () => {
        await AppDataSource.initialize();
    });

    afterAll(async () => {
        await AppDataSource.destroy();
    });

    it('should create a subscription with customer-oriented fields', async () => {
        // Create a test user first
        const userRepo = AppDataSource.getRepository(User);
        const user = userRepo.create({
            email: 'test@example.com',
            passwordHash: 'hashedPassword123',
            name: 'Test User',
            role: 'user',
            status: 'active'
        });
        await userRepo.save(user);

        // Create subscription with new fields
        const subscriptionRepo = AppDataSource.getRepository(Subscription);
        const subscription = subscriptionRepo.create({
            userId: user.id,
            planType: 'monthly',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            status: 'active',
            paymentStatus: 'paid',
            amount: 99.99,
            nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            currentUsage: 0,
            usageLimit: 100,
            features: {
                maxDevices: 5,
                supportLevel: 'premium',
                additionalServices: ['training', 'support']
            },
            billingHistory: [{
                date: new Date(),
                amount: 99.99,
                status: 'paid'
            }],
            usageHistory: [{
                date: new Date(),
                usage: 0,
                type: 'initial'
            }]
        });

        const savedSubscription = await subscriptionRepo.save(subscription);

        // Verify all fields are saved correctly
        expect(savedSubscription.id).toBeDefined();
        expect(savedSubscription.nextBillingDate).toBeDefined();
        expect(savedSubscription.currentUsage).toBe(0);
        expect(savedSubscription.usageLimit).toBe(100);
        expect(savedSubscription.features.maxDevices).toBe(5);
        expect(savedSubscription.features.supportLevel).toBe('premium');
        expect(savedSubscription.billingHistory).toHaveLength(1);
        expect(savedSubscription.usageHistory).toHaveLength(1);

        // Clean up
        await subscriptionRepo.remove(savedSubscription);
        await userRepo.remove(user);
    });
});
