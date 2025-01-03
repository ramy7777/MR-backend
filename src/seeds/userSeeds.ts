import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import bcrypt from 'bcrypt';
import { logger } from '../utils/logger';

export async function seedUsers() {
  const userRepository = AppDataSource.getRepository(User);

  // Check if users already exist
  const existingUsers = await userRepository.find();
  if (existingUsers.length > 0) {
    logger.info('Users already exist, skipping seeding');
    return;
  }

  logger.info('Seeding users...');

  // Create admin user
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const admin = userRepository.create({
    email: 'admin@example.com',
    passwordHash: adminPasswordHash,
    name: 'John Admin',
    role: 'admin',
    status: 'active',
    contactInfo: {
      phone: '+1234567890',
      address: '123 Admin Street'
    }
  });

  // Create regular user
  const userPasswordHash = await bcrypt.hash('user123', 10);
  const user = userRepository.create({
    email: 'user@example.com',
    passwordHash: userPasswordHash,
    name: 'Jane User',
    role: 'user',
    status: 'active',
    contactInfo: {
      phone: '+0987654321',
      address: '456 User Avenue'
    }
  });

  try {
    await userRepository.save([admin, user]);
    logger.info('Successfully seeded users');
    logger.info('Admin credentials - Email: admin@example.com, Password: admin123');
    logger.info('User credentials - Email: user@example.com, Password: user123');
  } catch (error) {
    logger.error('Error seeding users:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  AppDataSource.initialize()
    .then(() => seedUsers())
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}
