"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const errorHandler_1 = require("./errorHandler");
const jwt_1 = require("../utils/jwt");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new errorHandler_1.AppError(401, 'No token provided');
        }
        const token = authHeader.split(' ')[1];
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new errorHandler_1.AppError(401, 'Not authenticated'));
        }
        if (roles.length && !roles.includes(req.user.role)) {
            return next(new errorHandler_1.AppError(403, 'Not authorized'));
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.js.map