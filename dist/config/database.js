"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupDatabase = exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const logger_1 = require("../utils/logger");
const User_1 = require("../entities/User");
const Subscription_1 = require("../entities/Subscription");
const Device_1 = require("../entities/Device");
const Rental_1 = require("../entities/Rental");
const Session_1 = require("../entities/Session");
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds
function parseDbUrl(url) {
    try {
        const matches = url.match(/^postgres(?:ql)?:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/);
        if (!matches) {
            throw new Error('Invalid database URL format');
        }
        const [, user, password, host, port, database] = matches;
        return {
            type: 'postgres',
            host,
            port: parseInt(port),
            username: user,
            password,
            database,
            ssl: { rejectUnauthorized: false },
            synchronize: false,
            logging: false
        };
    }
    catch (error) {
        logger_1.logger.error('Error parsing database URL:', { error, url: url.replace(/:[^:@]+@/, ':***@') });
        throw error;
    }
}
function getDataSourceConfig() {
    const isProd = process.env.NODE_ENV === 'production';
    logger_1.logger.info('Environment:', { NODE_ENV: process.env.NODE_ENV, isProd });
    if (!isProd) {
        return {
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            username: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_NAME || 'mr_platform',
            synchronize: true,
            logging: true,
            ssl: false
        };
    }
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is required in production');
    }
    const config = parseDbUrl(process.env.DATABASE_URL);
    const { password: _, ...loggableConfig } = config;
    logger_1.logger.info('Database configuration:', {
        ...loggableConfig,
        password: '***'
    });
    return config;
}
const config = getDataSourceConfig();
exports.AppDataSource = new typeorm_1.DataSource({
    ...config,
    entities: [User_1.User, Subscription_1.Subscription, Device_1.Device, Rental_1.Rental, Session_1.Session],
    cache: true,
    dropSchema: false,
    migrationsRun: false
});
const setupDatabase = async (retryCount = 0) => {
    try {
        if (!exports.AppDataSource.isInitialized) {
            await exports.AppDataSource.initialize();
            logger_1.logger.info('Database connection established successfully', {
                host: config.host,
                port: config.port,
                database: config.database
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Error connecting to database:', {
            error: {
                code: error.code,
                message: error.message,
                detail: error.detail,
                host: config.host,
                port: config.port,
                database: config.database
            }
        });
        if (retryCount < MAX_RETRIES) {
            logger_1.logger.info(`Retrying database connection in ${RETRY_DELAY / 1000} seconds... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return (0, exports.setupDatabase)(retryCount + 1);
        }
        throw error;
    }
};
exports.setupDatabase = setupDatabase;
//# sourceMappingURL=database.js.map