import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Recipe from '../models/Recipe.js';
import Version from '../models/Version.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import Follow from '../models/Follow.js';

import dotenv from 'dotenv';

dotenv.config();

const MONGO_USERNAME = process.env.MONGO_USERNAME;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection string - replace with your actual connection string
const MONGODB_URI = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@crud.mqpkeon.mongodb.net/prod?retryWrites=true&w=majority&appName=crud`;

async function readJsonFile(filePath) {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
}

async function uploadCollection(collectionPath, Model) {
    const files = await fs.readdir(collectionPath);
    console.log(`Uploading ${files.length} documents to ${Model.modelName}...`);
    
    for (const file of files) {
        if (file.endsWith('.json')) {
            const filePath = path.join(collectionPath, file);
            const data = await readJsonFile(filePath);
            
            try {
                // Convert string dates to Date objects
                if (data.createdAt) data.createdAt = new Date(data.createdAt);
                if (data.updatedAt) data.updatedAt = new Date(data.updatedAt);
                
                // Create new document
                const doc = new Model(data);
                await doc.save();

                // If this is a Follow document, update the user counts
                if (Model.modelName === 'Follow') {
                    // Update follower count for the followed user
                    await User.findByIdAndUpdate(
                        data.followed,
                        { $inc: { followerCount: 1 } }
                    );
                    
                    // Update following count for the follower user
                    await User.findByIdAndUpdate(
                        data.follower,
                        { $inc: { followingCount: 1 } }
                    );
                }

                console.log(`Uploaded ${file} to ${Model.modelName}`);
            } catch (error) {
                console.error(`Error uploading ${file} to ${Model.modelName}:`, error.message);
            }
        }
    }
}

async function uploadAllData() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const basePath = path.join(__dirname, 'dummy_data');

        // Upload each collection
        // await uploadCollection(path.join(basePath, 'recipes'), Recipe);
        // await uploadCollection(path.join(basePath, 'versions'), Version);
        // await uploadCollection(path.join(basePath, 'comments'), Comment);
        await uploadCollection(path.join(basePath, 'follows'), Follow);

        console.log('All data uploaded successfully!');
    } catch (error) {
        console.error('Error uploading data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the upload
uploadAllData(); 