import { DataSource } from 'typeorm';
import { logger } from '../utils/logger';
import { User } from '../entities/User';
import { Subscription } from '../entities/Subscription';
import { Device } from '../entities/Device';
import { Rental } from '../entities/Rental';
import { Session } from '../entities/Session';

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

const getDataSourceConfig = () => {
  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
    // Use the internal URL for production
    return {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      synchronize: false,
      logging: false,
    };
  }

  // Development configuration
  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'mr_platform',
    ssl: false,
    synchronize: true,
    logging: true,
  };
};

const config = getDataSourceConfig();

export const AppDataSource = new DataSource({
  ...config,
  entities: [User, Subscription, Device, Rental, Session],
  cache: true,
  dropSchema: false,
  migrationsRun: false,
} as any); // Type assertion needed due to dynamic config

export const setupDatabase = async (retryCount = 0): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info('Database connection established successfully', {
        url: process.env.NODE_ENV === 'production' ? 'Production URL' : `${config.host}:${config.port}`,
        database: process.env.NODE_ENV === 'production' ? 'Production DB' : config.database,
      });
    }
  } catch (error: any) {
    const errorDetails = {
      code: error.code,
      message: error.message,
      detail: error.detail,
      host: process.env.NODE_ENV === 'production' ? 'Production Host' : config.host,
      database: process.env.NODE_ENV === 'production' ? 'Production DB' : config.database,
    };

    logger.error('Error connecting to database:', { error: errorDetails });

    if (retryCount < MAX_RETRIES) {
      logger.info(`Retrying database connection in ${RETRY_DELAY / 1000} seconds... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return setupDatabase(retryCount + 1);
    }

    throw error;
  }
};
