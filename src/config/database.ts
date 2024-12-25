import { DataSource } from 'typeorm';
import { Client } from 'pg';
import { User } from '../entities/User';
import { Subscription } from '../entities/Subscription';
import { Device } from '../entities/Device';
import { Rental } from '../entities/Rental';
import { Session } from '../entities/Session';
import { logger } from '../utils/logger';

const dbName = process.env.DB_NAME || 'mr_platform';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'postgres';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '5432');

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: dbHost,
  port: dbPort,
  username: dbUser,
  password: dbPassword,
  database: dbName,
  entities: [User, Subscription, Device, Rental, Session],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
  ssl: process.env.DB_SSL === 'true',
  cache: true,
  dropSchema: false,
  migrationsRun: false,
  extra: {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }
});

async function createDatabase() {
  const client = new Client({
    user: dbUser,
    password: dbPassword,
    host: dbHost,
    port: dbPort,
    database: 'postgres' // Connect to default database
  });

  try {
    await client.connect();
    // Check if database exists
    const result = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (result.rows.length === 0) {
      // Database does not exist, create it
      await client.query(`CREATE DATABASE ${dbName}`);
      logger.info(`Database ${dbName} created successfully`);
    }
  } catch (error) {
    logger.error('Error creating database:', error);
    throw error;
  } finally {
    await client.end();
  }
}

export const setupDatabase = async () => {
  try {
    await createDatabase();
    await AppDataSource.initialize();
    logger.info('Database connection established');
  } catch (error) {
    logger.error('Error connecting to database:', error);
    throw error;
  }
};
