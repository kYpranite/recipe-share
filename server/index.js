import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import express from 'express';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// const MONGO_USERNAME = process.env.MONGO_USERNAME;
// const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
// const MONGO_URL = process.env.MONGO_URL;
// const MONGO_DATABASE = process.env.MONGO_DATABASE;

// const uri = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_URL}/?retryWrites=true&w=majority&appName=${MONGO_DATABASE}`;

// const client = new MongoClient(uri);

// async function connectToDatabase() {
//   try {
//     await client.connect();
//     console.log("Successfully connected to MongoDB");

//     const database = client.db('recipe_app');
//     const users = database.collection("users");

//     // Optional test query
//     const user = await users.findOne({ name: "irvin" });
//     console.log("Sample query result:", user);
//   } catch (err) {
//     console.error("Failed to connect to MongoDB:", err);
//     process.exit(1);
//   }
// }

async function startServer() {
  // await connectToDatabase();

  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();