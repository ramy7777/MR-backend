"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupDatabase = exports.getAppDataSource = void 0;
const typeorm_1 = require("typeorm");
const logger_1 = require("../utils/logger");
const User_1 = require("../entities/User");
const Subscription_1 = require("../entities/Subscription");
const Device_1 = require("../entities/Device");
const Rental_1 = require("../entities/Rental");
const Session_1 = require("../entities/Session");
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds
const DB_URL_WAIT_TIME = 30000; // 30 seconds
function parseDbUrl(url) {
    try {
        const matches = url.match(/^postgres(?:ql)?:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/);
        if (!matches) {
            throw new Error('Invalid database URL format');
        }
        const [, user, password, host, port, database] = matches;
        const isLocalhost = host === 'localhost' || host === '127.0.0.1';
        return {
            type: 'postgres',
            host,
            port: parseInt(port),
            username: user,
            password,
            database,
            ssl: !isLocalhost && process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
            synchronize: false,
            logging: false
        };
    }
    catch (error) {
        logger_1.logger.error('Error parsing database URL:', { error, url: url.replace(/:[^:@]+@/, ':***@') });
        throw error;
    }
}
async function waitForDatabaseUrl(maxWaitTime = DB_URL_WAIT_TIME) {
    const startTime = Date.now();
    while (Date.now() - startTime < maxWaitTime) {
        if (process.env.DATABASE_URL) {
            return;
        }
        logger_1.logger.info('Waiting for DATABASE_URL to be set...', {
            elapsed: Math.round((Date.now() - startTime) / 1000) + 's',
            maxWait: Math.round(maxWaitTime / 1000) + 's'
        });
        await new Promise(resolve => setTimeout(resolve, 5000)); // Check every 5 seconds
    }
    throw new Error(`DATABASE_URL not available after ${maxWaitTime / 1000} seconds`);
}
async function getDataSourceConfig() {
    const isProd = process.env.NODE_ENV?.trim() === 'production';
    logger_1.logger.info('Environment variables:', {
        NODE_ENV: process.env.NODE_ENV,
        NODE_ENV_TRIMMED: process.env.NODE_ENV?.trim(),
        isProd,
        DATABASE_URL: process.env.DATABASE_URL ? '[REDACTED]' : undefined,
        DB_HOST: process.env.DB_HOST,
        DB_PORT: process.env.DB_PORT,
        DB_NAME: process.env.DB_NAME,
        PWD: process.env.PWD,
        PATH: process.env.PATH?.split(':').length,
        env_keys: Object.keys(process.env).filter(key => !key.includes('SECRET') && !key.includes('KEY')).join(', ')
    });
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
        logger_1.logger.info('DATABASE_URL not found, waiting...');
        await waitForDatabaseUrl();
    }
    if (!process.env.DATABASE_URL) {
        logger_1.logger.error('Missing DATABASE_URL in production');
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
let dataSource = null;
const getAppDataSource = async () => {
    if (!dataSource) {
        const config = await getDataSourceConfig();
        dataSource = new typeorm_1.DataSource({
            ...config,
            entities: [User_1.User, Subscription_1.Subscription, Device_1.Device, Rental_1.Rental, Session_1.Session],
            cache: true,
            dropSchema: false,
            migrationsRun: false
        });
    }
    return dataSource;
};
exports.getAppDataSource = getAppDataSource;
const setupDatabase = async (retryCount = 0) => {
    try {
        const ds = await (0, exports.getAppDataSource)();
        if (!ds.isInitialized) {
            await ds.initialize();
            const config = ds.options;
            logger_1.logger.info('Database connection established successfully', {
                host: config.host,
                port: config.port,
                database: config.database
            });
        }
    }
    catch (error) {
        const ds = await (0, exports.getAppDataSource)();
        const config = ds.options;
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