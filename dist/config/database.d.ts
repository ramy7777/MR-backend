import { DataSource } from 'typeorm';
export declare const getAppDataSource: () => Promise<DataSource>;
export declare const setupDatabase: (retryCount?: number) => Promise<void>;
