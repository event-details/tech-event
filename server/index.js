const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

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

// Path to data files
const LEADERBOARD_FILE = path.join(__dirname, 'data', 'leaderboardData.json');
const EVENT_DATA_FILE = path.join(__dirname, 'data', 'data.json');
const CHATBOT_DATA_FILE = path.join(__dirname, 'data', 'chatbotData.json');

// GET endpoint to retrieve event data
app.get('/api/event-data', async (req, res) => {
  try {
    const data = await fs.readFile(EVENT_DATA_FILE, 'utf8');
    const eventData = JSON.parse(data);
    res.json(eventData);
  } catch (error) {
    console.error('Error reading event data:', error);
    res.status(500).json({ error: 'Failed to read event data' });
  }
});

// POST endpoint to update event data
app.post('/api/event-data', async (req, res) => {
  try {
    const { title, subtitle, date, venue, email, feedbackLink, rows } = req.body;
    
    // Validate required fields
    if (!title || !subtitle || !date || !venue || !email || !rows) {
      return res.status(400).json({ error: 'All fields except feedbackLink are required' });
    }

    // Validate rows is an array
    if (!Array.isArray(rows)) {
      return res.status(400).json({ error: 'Rows must be an array' });
    }

    const updatedEventData = {
      eventData: {
        title,
        subtitle,
        date,
        venue,
        email,
        feedbackLink: feedbackLink || '',
        rows
      }
    };

    await fs.writeFile(EVENT_DATA_FILE, JSON.stringify(updatedEventData, null, 2));
    res.json({ success: true, message: 'Event data updated successfully' });
  } catch (error) {
    console.error('Error updating event data:', error);
    res.status(500).json({ error: 'Failed to update event data' });
  }
});

// GET endpoint to retrieve chatbot data
app.get('/api/chatbot-data', async (req, res) => {
  try {
    const data = await fs.readFile(CHATBOT_DATA_FILE, 'utf8');
    const chatbotData = JSON.parse(data);
    res.json(chatbotData);
  } catch (error) {
    console.error('Error reading chatbot data:', error);
    res.status(500).json({ error: 'Failed to read chatbot data' });
  }
});

// GET endpoint to retrieve leaderboard data
app.get('/api/leaderboard', async (req, res) => {
  try {
    const data = await fs.readFile(LEADERBOARD_FILE, 'utf8');
    const leaderboard = JSON.parse(data);
    res.json(leaderboard);
  } catch (error) {
    console.error('Error reading leaderboard:', error);
    res.status(500).json({ error: 'Failed to read leaderboard data' });
  }
});

// Initialize leaderboard file if it doesn't exist
const initializeLeaderboard = async () => {
  try {
    await fs.access(LEADERBOARD_FILE);
  } catch (error) {
    // File doesn't exist, create it with initial structure
    await fs.writeFile(LEADERBOARD_FILE, JSON.stringify({ leaderboard: [] }, null, 2));
  }
};

// Initialize on startup
initializeLeaderboard().catch(console.error);

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

    // Read existing leaderboard data
    let leaderboard;
    try {
      const data = await fs.readFile(LEADERBOARD_FILE, 'utf8');
      leaderboard = JSON.parse(data).leaderboard;
    } catch (error) {
      leaderboard = [];
    }

    // Check if vulnerability already exists for the same name
    if (leaderboard.some(entry => entry.name === name && entry.vulnerability === vulnerability)) {
      return res.status(400).json({ ok: false, error: 'Vulnerability already submitted with your name once.' });
    }

    // Add new entry with timestamp and all fields
    const newEntry = { 
      name, 
      mode, 
      vulnerability, 
      prompt: vulnerability, // Store prompt separately for display compatibility
      timestamp: new Date().toISOString() 
    };
    leaderboard.push(newEntry);

    // Sort leaderboard by timestamp in ascending order
    leaderboard.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Write to a temporary file first, then rename to ensure atomicity
    const tempFile = `${LEADERBOARD_FILE}.tmp`;
    await fs.writeFile(tempFile, JSON.stringify({ leaderboard }, null, 2));
    await fs.rename(tempFile, LEADERBOARD_FILE);

    res.status(201).json({ ok: true, entry: newEntry });
  } catch (error) {
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

    // Reset leaderboard to empty array
    const emptyLeaderboard = { leaderboard: [] };
    await fs.writeFile(LEADERBOARD_FILE, JSON.stringify(emptyLeaderboard, null, 2));
    console.log('Leaderboard cleared successfully');
    res.json({ message: 'Leaderboard cleared successfully' });
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
