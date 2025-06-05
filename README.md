# RecipeShare

A full-stack web application for sharing and discovering recipes, built with React and Node.js.

## Project Requirements

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn

## Running the Application Locally

### Step 1: Clone and Setup
```bash
# Clone the repository
git clone https://github.com/your-username/recipe-share.git
cd recipe-share

# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install

# Install root dependencies
cd ..
npm install
```

### Step 2: Environment Setup

1. Create a `.env` file in the server directory:
```bash
cd server
touch .env
```

2. Add the following to your `.env` file:
```env
# MongoDB Configuration
MONGO_USERNAME=your_mongodb_username
MONGO_PASSWORD=your_mongodb_password
# JWT Configuration
JWT_SECRET=your_secure_jwt_secret
```

### Step 3: Start the Application

1. Start front and backend concurrently
```bash
npm run dev # in root directory
```

3. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Features

### Core Features
- User authentication (signup/login)
- User profiles with customizable information
- Recipe creation and management
- Search functionality for users and recipes
- Social features (following, likes, comments)
- Responsive design for all devices

### User Features
- Profile customization
- Follow/unfollow other users
- View user profiles
- Search for other users
- View user activity and recipes

### Recipe Features
- Create and edit recipes
- Upload recipe images
- Search and discover recipes
- View version history of recipes
- Fork (copy) recipes and make your own changes
- Like and comment on recipes
- View recipe details and instructions

## Project Structure
```
recipe-share/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context providers
│   │   ├── pages/         # Page components
│   │   ├── assets/        # Static assets
│   └── public/            # Public static files
└── server/                # Backend Express application
    ├── models/            # Database models
    ├── routes/            # API routes
    ├── middleware/        # Custom middleware
    └── utils/             # Utility functions
```

