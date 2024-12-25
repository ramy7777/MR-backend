import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      logger.warn('No token provided');
      throw new AppError(401, 'No token provided');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      logger.warn('Invalid token format');
      throw new AppError(401, 'Invalid token format');
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
    };

    logger.info('Token decoded successfully', { decoded });
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.error('Invalid token', { error });
      next(new AppError(401, 'Invalid token'));
    } else {
      logger.error('Authentication error', { error });
      next(error);
    }
  }
};
