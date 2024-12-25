import { Request, Response, NextFunction } from 'express';
export declare class SubscriptionController {
    private subscriptionService;
    createSubscription: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getUserSubscriptions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getSubscription: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    cancelSubscription: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    renewSubscription: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updatePaymentStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
