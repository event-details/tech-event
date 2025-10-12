// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const { initializeSupabase } = require('./config/supabase');
const LeaderboardService = require('./services/leaderboardService');
const DataService = require('./services/dataService');

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// Configure CORS
app.use(cors({
  origin: isProduction ? true : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'DELETE'],
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Path to data files (only leaderboard still uses direct file path for reference)
const LEADERBOARD_FILE = path.join(__dirname, 'data', 'leaderboardData.json');

// GET endpoint to retrieve event data
app.get('/api/event-data', async (req, res) => {
  try {
    const eventData = await DataService.getEventData();
    res.json(eventData);
  } catch (error) {
    console.error('Error reading event data:', error);
    res.status(500).json({ error: 'Failed to read event data' });
  }
});

// POST endpoint to update event data
app.post('/api/event-data', async (req, res) => {
  try {
    const { title, subtitle, date, venue, email, feedbackLink, rows, speakers } = req.body;
    
    // Validate required fields
    if (!title || !subtitle || !date || !venue || !email || !rows) {
      return res.status(400).json({ error: 'All fields except feedbackLink and speakers are required' });
    }

    // Validate rows is an array
    if (!Array.isArray(rows)) {
      return res.status(400).json({ error: 'Rows must be an array' });
    }

    // Validate speakers is an array (if provided)
    if (speakers !== undefined && !Array.isArray(speakers)) {
      return res.status(400).json({ error: 'Speakers must be an array' });
    }

    const updatedEventData = {
      eventData: {
        title,
        subtitle,
        date,
        venue,
        email,
        feedbackLink: feedbackLink || '',
        rows,
        speakers: speakers || []
      }
    };

    await DataService.saveEventData(updatedEventData);
    res.json({ success: true, message: 'Event data updated successfully' });
  } catch (error) {
    console.error('Error updating event data:', error);
    res.status(500).json({ error: 'Failed to update event data' });
  }
});

// GET endpoint to retrieve chatbot data
app.get('/api/chatbot-data', async (req, res) => {
  try {
    const chatbotData = await DataService.getChatbotData();
    res.json(chatbotData);
  } catch (error) {
    console.error('Error reading chatbot data:', error);
    res.status(500).json({ error: 'Failed to read chatbot data' });
  }
});

// POST endpoint to update chatbot data
app.post('/api/chatbot-data', async (req, res) => {
  try {
    const { responses, fallback } = req.body;
    
    // Validate required fields
    if (!responses || !fallback) {
      return res.status(400).json({ error: 'Responses and fallback are required' });
    }

    // Validate responses is an array
    if (!Array.isArray(responses)) {
      return res.status(400).json({ error: 'Responses must be an array' });
    }

    const updatedChatbotData = {
      responses,
      fallback
    };

    await DataService.saveChatbotData(updatedChatbotData);
    res.json({ success: true, message: 'Chatbot data updated successfully' });
  } catch (error) {
    console.error('Error updating chatbot data:', error);
    res.status(500).json({ error: 'Failed to update chatbot data' });
  }
});

// GET endpoint to retrieve leaderboard data
app.get('/api/leaderboard', async (req, res) => {
  try {
    const leaderboard = await LeaderboardService.getLeaderboard();
    res.json(leaderboard);
  } catch (error) {
    console.error('Error reading leaderboard:', error);
    res.status(500).json({ error: 'Failed to read leaderboard data' });
  }
});

// Initialize on startup
const initializeServices = async () => {
  try {
    // Initialize Supabase
    await initializeSupabase();
    // Initialize leaderboard file as fallback
    await LeaderboardService.initializeLeaderboardFile();
  } catch (error) {
    console.error('Error initializing services:', error);
  }
};

initializeServices();

// POST endpoint to add new entry to leaderboard
app.post('/api/leaderboard', async (req, res) => {
  try {
    const { name, mode, vulnerability } = req.body;

    // Validate input fields
    if (!name || !mode || !vulnerability) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }
    if (name.length > 100 || mode.length > 50 || vulnerability.length > 500) {
      return res.status(400).json({ ok: false, error: 'Field length exceeded' });
    }

    // Create entry object
    const entry = {
      name,
      mode,
      vulnerability,
      prompt: vulnerability,
      timestamp: new Date().toISOString()
    };

    const result = await LeaderboardService.addLeaderboardEntry(entry);
    res.status(201).json(result);
  } catch (error) {
    if (error.message.includes('Vulnerability already submitted')) {
      return res.status(400).json({ ok: false, error: error.message });
    }
    console.error('Error updating leaderboard:', error);
    res.status(500).json({ ok: false, error: 'Failed to update leaderboard' });
  }
});

// DELETE endpoint to clear leaderboard with password protection
app.delete('/api/leaderboard', async (req, res) => {
  try {
    const { password } = req.body;
    
    // Check password (in production, use environment variable)
    const ADMIN_PASSWORD = 'tech-meet-2025'; // In production, use process.env.ADMIN_PASSWORD
    
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const result = await LeaderboardService.clearLeaderboard();
    console.log('Leaderboard cleared successfully');
    res.json(result);
  } catch (error) {
    console.error('Error clearing leaderboard:', error);
    res.status(500).json({ error: 'Failed to clear leaderboard' });
  }
});

// Serve static files in production
if (isProduction) {
  // Serve static files from the dist directory
  app.use(express.static(path.join(__dirname, 'dist')));

  // Handle client-side routing by serving index.html for all non-API routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    }
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Mode: ${isProduction ? 'production' : 'development'}`);
});
