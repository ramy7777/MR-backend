import { AppDataSource } from '../config/database';

beforeAll(async () => {
  // Set up any global test configuration
  jest.setTimeout(10000); // 10 seconds
});

afterAll(async () => {
  // Clean up any global test configuration
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});
