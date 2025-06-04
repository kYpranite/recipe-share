import mongoose from 'mongoose';
import dotenv from 'dotenv';
import '../models/User.js';

dotenv.config();

const MONGO_USERNAME = process.env.MONGO_USERNAME;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
const uri = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@crud.mqpkeon.mongodb.net/?retryWrites=true&w=majority&appName=crud`;

async function checkDatabase() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Get the User model
    const User = mongoose.model('User');
    
    // Find all users
    const users = await User.find({}).select('-password');
    
    console.log('\nUsers in database:');
    console.log(JSON.stringify(users, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkDatabase(); 