# RecipeShare

A full-stack web application for sharing and discovering recipes
## Project Requirements

## Running the Application Locally

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
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
```env
# Server Configuration
PORT=3000

# MongoDB Configuration
MONGO_USERNAME=your_mongodb_username
MONGO_PASSWORD=your_mongodb_password
MONGO_DATABASE=recipe_share

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret

# Environment
NODE_ENV=production
```

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

## Features

### Core Features
- User authentication (signup/login)
- Dynamic recipe feed
- Recipe creation and editing
- Search functionality (by name, cuisine, ingredients)
- User profiles and following system

### Additional Features
- Recipe forking and version history
- Rating and commenting system
- Recipe likes and trending section
- User search functionality

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

## Key Features

### Authentication & Security
- JWT-based authentication
- Protected routes
- User authorization
- Secure password handling

### Recipe Management
- Create and edit recipes
- Upload recipe images
- Version control for recipes
- Fork existing recipes
- Private/public recipe settings

### Social Features
- User profiles
- Follow other users
- Like and comment on recipes
- Rate recipes
- View trending recipes

### Search Functionality
- Search by recipe name
- Search by cuisine type
- Search by ingredients
- User search
- Real-time search results

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Recipes
- `POST /api/recipes` - Create new recipe
- `GET /api/recipes/:id` - Get single recipe
- `GET /api/recipes/recent` - Get recent recipes
- `GET /api/recipes/trending` - Get trending recipes
- `POST /api/recipes/:id/fork` - Fork recipe
- `GET /api/recipes/:id/versions` - Get version history

### User Interactions
- `POST /api/recipes/:id/comment` - Add comment
- `POST /api/recipes/:id/rate` - Rate recipe
- `POST /api/recipes/:id/like` - Like recipe
- `POST /api/users/:id/follow` - Follow user

## Development & Testing

### Development Mode
For easier testing and development:
1. Open `client/src/context/AuthContext.jsx`
2. Set `const DEV_MODE = true;`
3. Refresh your browser

In development mode:
- No login required
- Data is stored in localStorage
- All features are accessible

### Available Scripts

#### Backend (server directory)
```bash
npm run dev     # Start development server
npm start       # Start production server
npm test        # Run tests
```

#### Frontend (client directory)
```bash
npm run dev     # Start development server
npm build       # Build for production
npm preview     # Preview production build
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Verify MongoDB Atlas credentials
   - Check network connectivity
   - Ensure IP whitelist is configured

2. **Port Already in Use**
   - Change the PORT in `.env`
   - Kill the process: `kill $(lsof -t -i:3000)`

3. **Module Not Found Errors**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again

4. **CORS Errors**
   - Ensure backend is running on port 3000
   - Check frontend API requests

## Contributing
This project was created for UCLA's CS35L course. For more information about contributing or using this code, please contact the development team.

## License
This project is licensed under the MIT License - see the LICENSE file for details.


