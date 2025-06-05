# RecipeShare

A community-driven recipe platform where users can create, edit, browse, and share cooking recipes. Built for UCLA's CS35L course.

## Quick Start Guide

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

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
```

### Step 2: Environment Setup

1. Create a `.env` file in the server directory:
```bash
cd server
touch .env
```

2. Add the following to your `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/recipe-share
JWT_SECRET=your_secret_key_here
PORT=3000
```

Note: Replace `mongodb://localhost:27017/recipe-share` with your MongoDB connection string if using MongoDB Atlas.

### Step 3: Start the Application

1. Start the backend server:
```bash
cd server
npm run dev
```

2. In a new terminal, start the frontend:
```bash
cd client
npm run dev
```

3. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Development Mode

For easier testing and development, you can enable development mode:

1. Open `client/src/context/AuthContext.jsx`
2. Set `const DEV_MODE = true;`
3. Refresh your browser

In development mode:
- No login required
- Data is stored in localStorage
- All features are accessible

## Available Scripts

### Backend (server directory)
```bash
npm run dev     # Start development server
npm start       # Start production server
npm test        # Run tests
```

### Frontend (client directory)
```bash
npm run dev     # Start development server
npm build       # Build for production
npm preview     # Preview production build
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running locally
   - Check your MongoDB connection string in `.env`
   - Verify network connectivity if using MongoDB Atlas

2. **Port Already in Use**
   - Change the PORT in `.env` if 3000 is occupied
   - Kill the process using the port: `kill $(lsof -t -i:3000)`

3. **Module Not Found Errors**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again

4. **CORS Errors**
   - Ensure backend is running on port 3000
   - Check that frontend is making requests to correct URL

## Project Structure

```
recipe-share/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context providers
│   │   ├── pages/          # Page components
│   │   └── assets/         # Static assets
│   └── public/             # Public static files
└── server/                 # Backend Express application
    ├── models/             # Database models
    ├── routes/             # API routes
    ├── middleware/         # Custom middleware
    └── utils/              # Utility functions
```

## API Documentation

The API documentation is available at http://localhost:3000/api-docs when running the server.

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the API documentation
3. Check the commit history for recent changes
4. Contact the development team


## Features

- User authentication (signup/login)
- Modern UI and navigation
- Dynamic recipe feed (see your own recipes instantly)
- Profile editing with avatar and bio
- Create and share recipes with detailed instructions
- Browse recipes in a personalized feed
- Search recipes by name, cuisine, or ingredients
- Fork and modify existing recipes
- Rate and comment on recipes
- Follow other users
- View recipe version history

## Tech Stack

### Frontend
- React (with Vite)
- React Router for navigation
- CSS Modules for styling
- Context API for state management

### Backend
- Node.js/Express
- MongoDB
- JWT for authentication

## Frontend Routes

- `/` - Redirects to home
- `/login` - Login page
- `/signup` - Signup page
- `/home` - Home feed (protected)
- `/create-recipe` - Create new recipe (protected)
- `/edit-profile` - Edit your profile (protected)
- `/recipe/:id` - View recipe details
- `/profile/:username` - View user profile
- `/my-profile` - User's dashboard (protected)

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Recipes
- `POST /api/recipes` - Create new recipe
- `GET /api/recipes/:id` - Get single recipe
- `GET /api/feed` - Get trending/newest recipes
- `GET /api/search` - Search recipes

### User Interactions
- `POST /api/recipes/:id/comment` - Add comment
- `POST /api/recipes/:id/rate` - Rate recipe
- `POST /api/recipes/:id/fork` - Fork recipe
- `GET /api/recipes/:id/history` - Get version history
- `POST /api/users/:id/follow` - Follow user

## Development & Testing Tips

- **Bypass Authentication for Fast UI Testing:**
  - In `client/src/context/AuthContext.jsx`, set `const DEV_MODE = true;` to skip login and access all pages instantly.
  - Set it to `false` to require real authentication (sign up/log in).
  - Just change the value and refresh your browser to switch modes.

- **View the Recipe Creation Form:**
  - Click "Create Recipe" in the NavBar or go to `/create-recipe` in your browser.

- **Switch Between Modes:**
  - Change the `DEV_MODE` flag as needed, then refresh your browser.
  - When `DEV_MODE` is `true`, you can test the UI and all pages without logging in.
  - When `DEV_MODE` is `false`, you must sign up or log in to access protected pages.

---


