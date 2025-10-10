# Deployment Guide

This application is set up for combined deployment, where both the React frontend and Express backend are served from the same server.

## Prerequisites

- Node.js 16+ installed on the server
- Git installed on the server
- Access to the deployment server

## Deployment Steps

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd tech-meet-event
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build and start the application:
   ```bash
   npm run deploy
   ```

   This will:
   - Build the React frontend (`npm run build`)
   - Start the server in production mode (`NODE_ENV=production`)

## Continuous Deployment

For continuous deployment, you can use platforms like:

1. **Heroku**
   - Connect your GitHub repository
   - Add the following buildpack: `heroku/nodejs`
   - The `package.json` start script will automatically run

2. **Digital Ocean App Platform**
   - Connect your GitHub repository
   - Select Node.js as the environment
   - The platform will automatically detect the build and start commands

3. **Railway/Render**
   - Connect your GitHub repository
   - Select Node.js as the environment
   - Use `npm run build` as the build command
   - Use `npm start` as the start command

## Environment Variables

Make sure to set the following environment variables in your production environment:

- `NODE_ENV=production`
- `PORT` (optional, defaults to 3001)

## File Storage

The leaderboard data is currently stored in `src/leaderboardData.json`. For production:

1. Consider using a proper database (MongoDB, PostgreSQL)
2. Or mount a persistent volume to store the JSON file
3. Ensure the directory has proper write permissions

## Monitoring

Monitor your application using:
1. Server logs
2. Application performance monitoring (APM) tools
3. Error tracking services

## Backup

Regularly backup the `leaderboardData.json` file or implement database backups if using a database system.