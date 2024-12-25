"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const deviceController_1 = require("../controllers/deviceController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const deviceController = new deviceController_1.DeviceController();
// Protected routes
router.use(auth_1.authenticate);
// Public device routes
router.get('/', deviceController.getAllDevices);
router.get('/:id', deviceController.getDevice);
router.get('/:id/stats', deviceController.getDeviceStats);
// Admin routes
router.use((0, auth_1.authorize)('admin'));
router.post('/', deviceController.createDevice);
router.patch('/:id', deviceController.updateDevice);
router.post('/:id/maintenance', deviceController.scheduleMaintenance);
exports.default = router;
//# sourceMappingURL=deviceRoutes.js.map