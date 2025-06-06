import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import '../models/User.js';

dotenv.config();

const MONGO_USERNAME = process.env.MONGO_USERNAME;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
const uri = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@crud.mqpkeon.mongodb.net/prod?retryWrites=true&w=majority&appName=crud`;

async function exportUsers() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Get the User model
    const User = mongoose.model('User');
    
    // Find all users and exclude sensitive fields
    const users = await User.find({}).select('-password -__v');
    
    // Convert to plain objects and format dates
    const formattedUsers = users.map(user => {
      const userObj = user.toObject();
      // Convert ObjectIds to strings
      userObj._id = userObj._id.toString();
      if (userObj.recipes) {
        userObj.recipes = userObj.recipes.map(id => id.toString());
      }
      return userObj;
    });

    // Write to JSON file
    const outputPath = './users_export.json';
    await fs.writeFile(outputPath, JSON.stringify(formattedUsers, null, 2));
    
    console.log(`Successfully exported ${formattedUsers.length} users to ${outputPath}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the export
exportUsers(); 