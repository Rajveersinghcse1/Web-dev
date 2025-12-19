# Coding Society Backend Setup Guide

## Prerequisites

1. **Node.js** (v16 or higher)
2. **MongoDB** (Local installation or MongoDB Atlas)
3. **Git**

## Installation Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

Create a `.env` file in the backend folder:

```bash
cp env.example .env
```

Edit the `.env` file with your configurations:
- Update `MONGODB_URI` with your MongoDB connection string
- Change `JWT_SECRET` to a secure random string
- Update other settings as needed

### 3. MongoDB Setup

#### Option A: Local MongoDB with MongoDB Compass

1. **Install MongoDB Community Edition**
   - Download from: https://www.mongodb.com/try/download/community
   - Follow installation instructions for your OS

2. **Install MongoDB Compass**
   - Download from: https://www.mongodb.com/products/compass
   - MongoDB Compass provides a GUI for managing your database

3. **Start MongoDB Service**
   - Windows: MongoDB should start automatically as a service
   - macOS/Linux: `sudo systemctl start mongod` or `brew services start mongodb-community`

4. **Connect with Compass**
   - Open MongoDB Compass
   - Connect to: `mongodb://localhost:27017`
   - Create database: `coding-society`

#### Option B: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Update `MONGODB_URI` in `.env`

### 4. Seed Database

Run the seeding script to populate initial data:

```bash
npm run seed
```

This will create:
- Sample achievements
- Initial quests
- Admin user (email: admin@codingsociety.com, password: Admin123!)
- Sample users for testing

### 5. Start Development Server

```bash
npm run dev
```

The server will start on http://localhost:5000

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with initial data
- `npm test` - Run tests (when implemented)

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Game System
- `GET /api/game/stats` - Get player stats
- `POST /api/game/level-up` - Level up player
- `PUT /api/game/character` - Update character
- `GET /api/game/leaderboard` - Get leaderboard

### Quests
- `GET /api/quests` - Get all quests
- `GET /api/quests/:id` - Get specific quest
- `POST /api/quests/:id/start` - Start quest
- `POST /api/quests/:id/submit` - Submit quest solution
- `GET /api/quests/:id/progress` - Get quest progress

### Achievements
- `GET /api/achievements` - Get user achievements
- `POST /api/achievements/check` - Check for new achievements

## Database Schema

### User
- Personal information and authentication
- Game progression (XP, level, coins, gems)
- Character customization
- Achievement tracking
- Quest progress

### Quest
- Challenge details and constraints
- Story and theme information
- Test cases and validation
- Rewards and difficulty

### Achievement
- Requirements and conditions
- Rewards and rarity
- Progress tracking

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- CORS protection
- Input validation and sanitization

## Real-time Features

- Socket.io for live notifications
- Achievement unlocks
- Leaderboard updates
- Battle arena (when implemented)

## Development Tips

1. **Database Inspection**
   - Use MongoDB Compass to view and modify data
   - Collections: users, quests, achievements

2. **Testing API**
   - Use Postman or Thunder Client
   - Import the provided API collection (when available)

3. **Logs**
   - Server logs show in console
   - Set LOG_LEVEL in .env for verbosity

4. **Hot Reload**
   - Backend uses nodemon for automatic restarts
   - Frontend changes require separate dev server

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB service is running
- Check connection string format
- Verify network access (for Atlas)

### Authentication Errors
- Check JWT_SECRET is set
- Verify token expiration settings
- Clear browser localStorage if needed

### CORS Issues
- Update CLIENT_URL in .env
- Check frontend port matches

## Next Steps

1. Set up frontend API integration
2. Test authentication flow
3. Implement additional features
4. Deploy to production environment

## Production Deployment

1. Update environment variables for production
2. Use process managers (PM2, Docker)
3. Set up SSL certificates
4. Configure production database
5. Enable monitoring and logging

For questions or issues, refer to the documentation or create an issue in the repository.