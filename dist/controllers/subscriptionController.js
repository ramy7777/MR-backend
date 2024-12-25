"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionController = void 0;
const subscriptionService_1 = require("../services/subscriptionService");
const errorHandler_1 = require("../middleware/errorHandler");
class SubscriptionController {
    constructor() {
        this.subscriptionService = new subscriptionService_1.SubscriptionService();
        this.createSubscription = async (req, res, next) => {
            try {
                const userId = req.user?.userId;
                if (!userId)
                    throw new errorHandler_1.AppError(401, 'Not authenticated');
                const { planType, amount } = req.body;
                if (!planType || !amount) {
                    throw new errorHandler_1.AppError(400, 'Plan type and amount are required');
                }
                const subscription = await this.subscriptionService.create(userId, {
                    planType,
                    amount,
                });
                res.status(201).json({
                    status: 'success',
                    data: { subscription },
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getUserSubscriptions = async (req, res, next) => {
            try {
                const userId = req.user?.userId;
                if (!userId)
                    throw new errorHandler_1.AppError(401, 'Not authenticated');
                const subscriptions = await this.subscriptionService.findByUser(userId);
                res.status(200).json({
                    status: 'success',
                    data: { subscriptions },
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getSubscription = async (req, res, next) => {
            try {
                const { id } = req.params;
                const subscription = await this.subscriptionService.findById(id);
                res.status(200).json({
                    status: 'success',
                    data: { subscription },
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.cancelSubscription = async (req, res, next) => {
            try {
                const { id } = req.params;
                const subscription = await this.subscriptionService.cancel(id);
                res.status(200).json({
                    status: 'success',
                    data: { subscription },
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.renewSubscription = async (req, res, next) => {
            try {
                const { id } = req.params;
                const subscription = await this.subscriptionService.renewSubscription(id);
                res.status(200).json({
                    status: 'success',
                    data: { subscription },
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.updatePaymentStatus = async (req, res, next) => {
            try {
                const { id } = req.params;
                const { status } = req.body;
                if (!status || !['paid', 'failed'].includes(status)) {
                    throw new errorHandler_1.AppError(400, 'Invalid payment status');
                }
                const subscription = await this.subscriptionService.updatePaymentStatus(id, status);
                res.status(200).json({
                    status: 'success',
                    data: { subscription },
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.SubscriptionController = SubscriptionController;
//# sourceMappingURL=subscriptionController.js.map