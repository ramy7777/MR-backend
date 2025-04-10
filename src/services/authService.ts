import bcrypt from 'bcryptjs';
import { getAppDataSource } from '../config/database';
import { User } from '../entities/User';
import { AppError } from '../middleware/errorHandler';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import { logger } from '../utils/logger';
import { Repository } from 'typeorm';

export class AuthService {
  private userRepository: Repository<User>;
  private dataSource: any;

  constructor() {
    this.initRepositories();
  }

  private async initRepositories() {
    this.dataSource = await getAppDataSource();
    this.userRepository = this.dataSource.getRepository(User);
  }

  async register(email: string, password: string, name: string) {
    await this.initRepositories();
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError(400, 'Email already registered');
    }

    // Check if this is the first user
    const userCount = await this.userRepository.count();
    const isFirstUser = userCount === 0;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      name,
      status: 'active',
      role: isFirstUser ? 'admin' : 'user'
    });

    await this.userRepository.save(user);
    logger.info('User registered:', { id: user.id, email: user.email, role: user.role });

    const tokens = this.generateAuthTokens(user);
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      ...tokens
    };
  }

  async login(email: string, password: string) {
    logger.info('Login attempt:', { email });
    await this.initRepositories();
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (!user) {
      logger.warn('Login failed - user not found:', { email });
      throw new AppError(401, 'Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      logger.warn('Login failed - invalid password:', { email });
      throw new AppError(401, 'Invalid credentials');
    }

    logger.info('User logged in successfully:', { id: user.id, email: user.email, role: user.role });
    const tokens = this.generateAuthTokens(user);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      ...tokens
    };
  }

  private generateAuthTokens(user: User) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    return {
      accessToken: generateToken(payload),
      refreshToken: generateRefreshToken(payload)
    };
  }
}
