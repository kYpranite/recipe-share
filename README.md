# RecipeShare

A community-driven recipe platform where users can create, edit, browse, and collaboratively refine cooking recipes. Built as part of UCLA's CS35L course.

## Recent UI/UX & Feature Improvements

- **Dynamic Recipe Feed:**
  - Home page displays recipes created by users (stored in localStorage in dev mode)
  - New recipes appear instantly in the feed
- **Profile Editing:**
  - Edit Profile page (`/edit-profile`) lets users set their name, bio, and avatar (with live preview)
  - Profile info is saved in localStorage (dev mode)
- **Navigation Improvements:**
  - NavBar includes links to Home, Create Recipe, My Profile, Edit Profile, and Logout
- **Cooking Theme:**
  - Subtle cooking icon in the NavBar
  - Accent colors inspired by food (gold, green)
  - Clean, inviting, and food-app-appropriate design

## Features

- User authentication (signup/login)
- **Premium, modern UI and navigation**
- **Dynamic recipe feed (see your own recipes instantly)**
- **Profile editing with avatar and bio**
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
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/recipe-share.git
cd recipe-share
```

2. Install frontend dependencies:
```bash
cd client
npm install
```

3. Install backend dependencies:
```bash
cd ../server
npm install
```

4. Create a `.env` file in the server directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=3000
```

### Running the Application

1. Start the backend server:
```bash
cd server
npm run dev
```

2. In a new terminal, start the frontend development server:
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

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


