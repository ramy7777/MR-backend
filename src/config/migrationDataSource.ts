import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Subscription } from '../entities/Subscription';
import { Device } from '../entities/Device';
import { Rental } from '../entities/Rental';
import { Session } from '../entities/Session';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'mr_platform',
    synchronize: false,
    logging: true,
    entities: [User, Subscription, Device, Rental, Session],
    migrations: ['src/migrations/*.ts'],
    migrationsTableName: 'migrations'
}); 