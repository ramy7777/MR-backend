import { Express } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import deviceRoutes from './deviceRoutes';
import subscriptionRoutes from './subscriptionRoutes';
import rentalRoutes from './rentalRoutes';

export const setupRoutes = (app: Express) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/devices', deviceRoutes);
  app.use('/api/subscriptions', subscriptionRoutes);
  app.use('/api/rentals', rentalRoutes);
};
