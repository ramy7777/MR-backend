"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subscriptionController_1 = require("../controllers/subscriptionController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const subscriptionController = new subscriptionController_1.SubscriptionController();
// Protected routes
router.use(auth_1.authenticate);
// User subscription routes
router.post('/', subscriptionController.createSubscription);
router.get('/my-subscriptions', subscriptionController.getUserSubscriptions);
router.get('/:id', subscriptionController.getSubscription);
router.post('/:id/cancel', subscriptionController.cancelSubscription);
router.post('/:id/renew', subscriptionController.renewSubscription);
// Admin routes
router.use((0, auth_1.authorize)('admin'));
router.patch('/:id/payment-status', subscriptionController.updatePaymentStatus);
exports.default = router;
//# sourceMappingURL=subscriptionRoutes.js.map