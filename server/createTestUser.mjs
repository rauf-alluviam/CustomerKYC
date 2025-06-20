import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import UserModel from './models/userModel.mjs';

// Load environment variables
dotenv.config();

const createTestUser = async () => {
  try {
    // Connect to MongoDB with timeout
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 second timeout
    });
    console.log('Connected to MongoDB');

    // Check if test user already exists
    const existingUser = await UserModel.findOne({ username: 'testuser' });
    if (existingUser) {
      console.log('Test user already exists');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create test user
    const testUser = new UserModel({
      username: 'testuser',
      password: hashedPassword,
      role: 'Admin',
      modules: ['KYC', 'Customer Management'],
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      employment_type: 'Full-time',
      designation: 'Administrator',
      department: 'IT',
      company: 'Test Company'
    });

    await testUser.save();
    console.log('Test user created successfully');
    console.log('Username: testuser');
    console.log('Password: password123');

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

createTestUser();
