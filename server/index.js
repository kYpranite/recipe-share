import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import userProfileRoutes from './routes/userProfile.js';
import userSearchRoutes from './routes/userSearch.js';
import recipeRoutes from './routes/recipes.js';
import commentRoutes from './routes/comments.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware setup
app.use(cors());
app.use(express.json());

// MongoDB connection setup
const MONGO_USERNAME = process.env.MONGO_USERNAME;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
const uri = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@crud.mqpkeon.mongodb.net/prod?retryWrites=true&w=majority&appName=crud`;

// Connect to MongoDB
mongoose.connect(uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  });

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userProfileRoutes);
app.use('/api/users', userSearchRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/comments', commentRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});