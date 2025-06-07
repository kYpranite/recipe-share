import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Recipe from '../models/Recipe.js';
import Version from '../models/Version.js';
import Comment from '../models/Comment.js';
import Follow from '../models/Follow.js';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGO_USERNAME = process.env.MONGO_USERNAME;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
const uri = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@crud.mqpkeon.mongodb.net/prod?retryWrites=true&w=majority&appName=crud`;

async function cleanupOrphanedDocuments() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Get all user IDs
    const users = await User.find({}).select('_id');
    const userIds = new Set(users.map(user => user._id.toString()));
    console.log(`Found ${userIds.size} valid users in the database`);

    // Clean up Comments
    const comments = await Comment.find({});
    let deletedComments = 0;
    for (const comment of comments) {
      if (!userIds.has(comment.author.toString())) {
        await Comment.findByIdAndDelete(comment._id);
        deletedComments++;
      }
    }
    console.log(`Deleted ${deletedComments} orphaned comments`);

    // Clean up Recipes
    const recipes = await Recipe.find({});
    let deletedRecipes = 0;
    for (const recipe of recipes) {
      if (!userIds.has(recipe.originalAuthor.toString())) {
        // Delete associated versions first
        await Version.deleteMany({ recipe: recipe._id });
        // Delete the recipe
        await Recipe.findByIdAndDelete(recipe._id);
        deletedRecipes++;
      }
    }
    console.log(`Deleted ${deletedRecipes} orphaned recipes and their versions`);

    // Clean up Versions
    const versions = await Version.find({});
    let deletedVersions = 0;
    for (const version of versions) {
      if (!userIds.has(version.author.toString())) {
        await Version.findByIdAndDelete(version._id);
        deletedVersions++;
      }
    }
    console.log(`Deleted ${deletedVersions} orphaned versions`);

    // Clean up Follows
    const follows = await Follow.find({});
    let deletedFollows = 0;
    for (const follow of follows) {
      if (!userIds.has(follow.follower.toString()) || !userIds.has(follow.following.toString())) {
        await Follow.findByIdAndDelete(follow._id);
        deletedFollows++;
      }
    }
    console.log(`Deleted ${deletedFollows} orphaned follows`);

    console.log('\nCleanup completed successfully!');
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

cleanupOrphanedDocuments(); 