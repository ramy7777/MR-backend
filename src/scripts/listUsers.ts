import { AppDataSource } from '../config/database';
import { User } from '../entities/User';

async function listUsers() {
  await AppDataSource.initialize();
  const userRepository = AppDataSource.getRepository(User);
  const users = await userRepository.find();
  
  console.log('\nExisting Users:');
  console.log('-------------');
  users.forEach(user => {
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`Status: ${user.status}`);
    console.log('-------------');
  });

  await AppDataSource.destroy();
}

listUsers().catch(console.error);
