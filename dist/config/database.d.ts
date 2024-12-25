import { DataSource } from 'typeorm';
export declare const AppDataSource: DataSource;
export declare const setupDatabase: (retryCount?: number) => Promise<void>;
