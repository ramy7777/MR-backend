import bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { AppError } from '../middleware/errorHandler';
import { generateToken, generateRefreshToken } from '../utils/jwt';

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  async register(email: string, password: string, name: string) {
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError(400, 'Email already registered');
    }

    // Check if this is the first user
    const userCount = await this.userRepository.count();
    const isFirstUser = userCount === 0;

    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      email,
      passwordHash,
      name,
      status: 'active',
      role: isFirstUser ? 'admin' : 'user' // First user gets admin role
    });

    await this.userRepository.save(user);

    const tokens = this.generateAuthTokens(user);
    return { user, ...tokens };
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new AppError(401, 'Invalid credentials');
    }

    const tokens = this.generateAuthTokens(user);
    return { user, ...tokens };
  }

  private generateAuthTokens(user: User) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role || 'user'
    };

    return {
      accessToken: generateToken(payload),
      refreshToken: generateRefreshToken(payload)
    };
  }
}
