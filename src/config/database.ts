import { DataSource, DataSourceOptions } from 'typeorm';
import { logger } from '../utils/logger';
import { User } from '../entities/User';
import { Subscription } from '../entities/Subscription';
import { Device } from '../entities/Device';
import { Rental } from '../entities/Rental';
import { Session } from '../entities/Session';

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

interface PostgresConfig extends DataSourceOptions {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl?: any;
}

function parseDbUrl(url: string): Partial<PostgresConfig> {
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
      ssl: { rejectUnauthorized: false }
    };
  } catch (error) {
    logger.error('Error parsing database URL:', { error, url: url.replace(/:[^:@]+@/, ':***@') });
    throw error;
  }
}

function getDataSourceConfig(): PostgresConfig {
  const isProd = process.env.NODE_ENV === 'production';
  const config = isProd && process.env.DATABASE_URL
    ? {
        ...parseDbUrl(process.env.DATABASE_URL),
        type: 'postgres' as const,
        synchronize: false,
        logging: false
      }
    : {
        type: 'postgres' as const,
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'mr_platform',
        synchronize: true,
        logging: true,
        ssl: false
      };

  const { password, ...loggableConfig } = config;
  logger.info('Database configuration:', {
    ...loggableConfig,
    password: '***'
  });

  return config as PostgresConfig;
}

const config = getDataSourceConfig();

export const AppDataSource = new DataSource({
  ...config,
  entities: [User, Subscription, Device, Rental, Session],
  cache: true,
  dropSchema: false,
  migrationsRun: false
});

export const setupDatabase = async (retryCount = 0): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info('Database connection established successfully', {
        host: config.host,
        port: config.port,
        database: config.database
      });
    }
  } catch (error: any) {
    logger.error('Error connecting to database:', {
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
      logger.info(`Retrying database connection in ${RETRY_DELAY / 1000} seconds... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return setupDatabase(retryCount + 1);
    }

    throw error;
  }
};
