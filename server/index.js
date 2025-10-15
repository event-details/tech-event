// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const { initializeSupabase } = require('./config/supabase');
const LeaderboardService = require('./services/leaderboardService');
const DataService = require('./services/dataService');
const ChatbotService = require('./services/chatbotService');

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
    
    // Refresh the chatbot service with new data
    await ChatbotService.refreshData();
    
    res.json({ success: true, message: 'Chatbot data updated successfully' });
  } catch (error) {
    console.error('Error updating chatbot data:', error);
    res.status(500).json({ error: 'Failed to update chatbot data' });
  }
});

// GET endpoint to retrieve vulnerability data
app.get('/api/vulnerability-data', async (req, res) => {
  try {
    const vulnerabilityData = await DataService.getVulnerabilityData();
    res.json(vulnerabilityData);
  } catch (error) {
    console.error('Error reading vulnerability data:', error);
    res.status(500).json({ error: 'Failed to read vulnerability data' });
  }
});

// POST endpoint to update vulnerability data
app.post('/api/vulnerability-data', async (req, res) => {
  try {
    const { vulnerabilities } = req.body;
    
    // Validate required fields
    if (!vulnerabilities || !Array.isArray(vulnerabilities)) {
      return res.status(400).json({ error: 'Vulnerabilities array is required' });
    }

    // Validate each vulnerability object
    vulnerabilities.forEach((vulnerability, index) => {
      if (!vulnerability.keywords || !Array.isArray(vulnerability.keywords)) {
        return res.status(400).json({ error: `Vulnerability ${index + 1}: keywords must be an array` });
      }
      
      // Support both 'description' and 'category' fields for backward compatibility
      const hasDescription = vulnerability.description && typeof vulnerability.description === 'string';
      const hasCategory = vulnerability.category && typeof vulnerability.category === 'string';
      
      if (!hasDescription && !hasCategory) {
        return res.status(400).json({ error: `Vulnerability ${index + 1}: must have either 'description' or 'category' field` });
      }
    });

    const updatedVulnerabilityData = {
      vulnerabilities
    };

    await DataService.saveVulnerabilityData(updatedVulnerabilityData);
    
    // Refresh the chatbot service with new vulnerability data
    await ChatbotService.refreshData();
    
    res.json({ success: true, message: 'Vulnerability data updated successfully' });
  } catch (error) {
    console.error('Error updating vulnerability data:', error);
    res.status(500).json({ error: 'Failed to update vulnerability data' });
  }
});

// POST endpoint for AI-enhanced chat processing
app.post('/api/chat', async (req, res) => {
  try {
    const { userMessage } = req.body;
    
    // Validate input
    if (!userMessage || typeof userMessage !== 'string') {
      return res.status(400).json({ 
        error: 'userMessage is required and must be a string',
        success: false 
      });
    }

    if (userMessage.trim().length === 0) {
      return res.status(400).json({ 
        error: 'userMessage cannot be empty',
        success: false 
      });
    }

    if (userMessage.length > 1000) {
      return res.status(400).json({ 
        error: 'userMessage is too long (max 1000 characters)',
        success: false 
      });
    }

    // Process the message using the advanced chatbot service
    const response = await ChatbotService.processMessage(userMessage);
    
    res.json({
      success: true,
      response: response.text,
      matchType: response.matchType,
      matchedKeyword: response.matchedKeyword,
      fuzzyScore: response.fuzzyScore,
      triggerBreakBot: response.triggerBreakBot,
      vulnerabilityDescription: response.vulnerabilityDescription,
      category: response.vulnerabilityDescription || 'Unknown',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error processing chat message:', error);
    res.status(500).json({ 
      error: 'Failed to process chat message',
      success: false 
    });
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
    // Initialize Supabase first
    await initializeSupabase();
    console.log('✅ Supabase initialization completed');
    
    // Initialize ChatbotService after Supabase is ready
    await ChatbotService.initializeService();
    console.log('✅ ChatbotService initialization completed');
    
    // Initialize leaderboard file as fallback
    await LeaderboardService.initializeLeaderboardFile();
    console.log('✅ All services initialized successfully');
  } catch (error) {
    console.error('Error initializing services:', error);
  }
};

initializeServices();

// POST endpoint to add new entry to leaderboard
app.post('/api/leaderboard', async (req, res) => {
  try {
    const { name, mode, vulnerability, category } = req.body;

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
      category: category || 'Unknown',
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
    
    // Check password from environment variable with fallback
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Avtrix08@';
    
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

// DEBUG endpoint to check system status (remove in production)
app.get('/api/debug/status', async (req, res) => {
  try {
    const { isSupabaseReady } = require('./config/supabase');
    
    let chatbotData = null;
    let eventData = null;
    let supabaseStatus = 'Not connected';
    
    if (isSupabaseReady()) {
      supabaseStatus = 'Connected';
      try {
        chatbotData = await DataService.getChatbotData();
      } catch (e) {
        chatbotData = { error: e.message };
      }
      
      try {
        eventData = await DataService.getEventData();
      } catch (e) {
        eventData = { error: e.message };
      }
    }
    
    res.json({
      timestamp: new Date().toISOString(),
      supabase: {
        status: supabaseStatus,
        url: process.env.SUPABASE_URL ? 'Set' : 'Not set',
        key: process.env.SUPABASE_ANON_KEY ? 'Set' : 'Not set'
      },
      chatbotData: {
        loaded: !!chatbotData,
        hasResponses: chatbotData?.responses?.length || 0,
        hasFallback: !!chatbotData?.fallback,
        error: chatbotData?.error
      },
      eventData: {
        loaded: !!eventData,
        hasEventData: !!eventData?.eventData,
        error: eventData?.error
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve static files in production
if (isProduction) {
  // Serve static files from the client dist directory
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // Handle client-side routing by serving index.html for all non-API routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
    }
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Mode: ${isProduction ? 'production' : 'development'}`);
});
