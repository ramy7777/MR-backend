import { DataSource, DataSourceOptions } from 'typeorm';
import { logger } from '../utils/logger';
import { User } from '../entities/User';
import { Subscription } from '../entities/Subscription';
import { Device } from '../entities/Device';
import { Rental } from '../entities/Rental';
import { Session } from '../entities/Session';

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds
const DB_URL_WAIT_TIME = 30000; // 30 seconds

type PostgresConfig = {
  type: 'postgres';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl?: boolean | { rejectUnauthorized: boolean };
  synchronize?: boolean;
  logging?: boolean;
  entities?: any[];
  cache?: boolean;
  dropSchema?: boolean;
  migrationsRun?: boolean;
};

function parseDbUrl(url: string): PostgresConfig {
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
  } catch (error) {
    logger.error('Error parsing database URL:', { error, url: url.replace(/:[^:@]+@/, ':***@') });
    throw error;
  }
}

async function waitForDatabaseUrl(maxWaitTime: number = DB_URL_WAIT_TIME): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    if (process.env.DATABASE_URL) {
      return;
    }
    logger.info('Waiting for DATABASE_URL to be set...', {
      elapsed: Math.round((Date.now() - startTime) / 1000) + 's',
      maxWait: Math.round(maxWaitTime / 1000) + 's'
    });
    await new Promise(resolve => setTimeout(resolve, 5000)); // Check every 5 seconds
  }
  
  throw new Error(`DATABASE_URL not available after ${maxWaitTime / 1000} seconds`);
}

async function getDataSourceConfig(): Promise<PostgresConfig> {
  const isProd = process.env.NODE_ENV?.trim() === 'production';
  logger.info('Environment variables:', {
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
    logger.info('DATABASE_URL not found, waiting...');
    await waitForDatabaseUrl();
  }

  if (!process.env.DATABASE_URL) {
    logger.error('Missing DATABASE_URL in production');
    throw new Error('DATABASE_URL is required in production');
  }

  const config = parseDbUrl(process.env.DATABASE_URL);

  const { password: _, ...loggableConfig } = config;
  logger.info('Database configuration:', {
    ...loggableConfig,
    password: '***'
  });

  return config;
}

let dataSource: DataSource | null = null;

export const getAppDataSource = async (): Promise<DataSource> => {
  if (!dataSource) {
    const config = await getDataSourceConfig();
    dataSource = new DataSource({
      ...config,
      entities: [User, Subscription, Device, Rental, Session],
      cache: true,
      dropSchema: false,
      migrationsRun: false
    });
  }
  return dataSource;
};

export const setupDatabase = async (retryCount = 0): Promise<void> => {
  try {
    const ds = await getAppDataSource();
    
    if (!ds.isInitialized) {
      await ds.initialize();
      const config = ds.options as PostgresConfig;
      logger.info('Database connection established successfully', {
        host: config.host,
        port: config.port,
        database: config.database
      });
    }
  } catch (error: any) {
    const ds = await getAppDataSource();
    const config = ds.options as PostgresConfig;
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
