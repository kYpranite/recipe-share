import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_USERNAME = process.env.MONGO_USERNAME;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;

console.log(MONGO_USERNAME, MONGO_PASSWORD);

// Temporarily using my own MongoDB Atlas cluster to test the app
const uri = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@recipe-share-temp.wu4mciw.mongodb.net/?retryWrites=true&w=majority&appName=recipe-share-temp`;

mongoose.connect(uri)
  .then(() => console.log('Successfully connected to MongoDB'))
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);


app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});