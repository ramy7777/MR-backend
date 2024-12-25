"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRoutes = void 0;
const authRoutes_1 = __importDefault(require("./authRoutes"));
const userRoutes_1 = __importDefault(require("./userRoutes"));
const deviceRoutes_1 = __importDefault(require("./deviceRoutes"));
const subscriptionRoutes_1 = __importDefault(require("./subscriptionRoutes"));
const rentalRoutes_1 = __importDefault(require("./rentalRoutes"));
const setupRoutes = (app) => {
    app.use('/api/auth', authRoutes_1.default);
    app.use('/api/users', userRoutes_1.default);
    app.use('/api/devices', deviceRoutes_1.default);
    app.use('/api/subscriptions', subscriptionRoutes_1.default);
    app.use('/api/rentals', rentalRoutes_1.default);
};
exports.setupRoutes = setupRoutes;
//# sourceMappingURL=index.js.map