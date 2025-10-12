# Supabase Setup Instructions

## Environment Variables

### For Local Development

1. **Copy the example file:**
   ```bash
   cd server
   cp .env.example .env
   ```

2. **Edit the `.env` file and add your Supabase credentials:**
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   NODE_ENV=development
   PORT=3001
   ADMIN_PASSWORD=your-custom-admin-password
   ```

3. **Start the server:**
   ```bash
   cd server
   node index.js
   ```

### For Production Deployment

Add these environment variables to your deployment platform (Render, Vercel, etc.):

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
NODE_ENV=production
ADMIN_PASSWORD=your_secure_admin_password
```

## Database Schema

Run this SQL in your Supabase SQL editor to create the leaderboard table:

```sql
-- Create leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  mode VARCHAR(50) NOT NULL,
  vulnerability VARCHAR(500) NOT NULL,
  prompt VARCHAR(500),
  category VARCHAR(200) DEFAULT 'Unknown',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create json_documents table for event data and chatbot data
CREATE TABLE IF NOT EXISTS json_documents (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  content JSONB NOT NULL,
  content_ordered TEXT, -- Store JSON as text to preserve key order
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_name_vulnerability 
ON leaderboard(name, vulnerability);

CREATE INDEX IF NOT EXISTS idx_leaderboard_timestamp 
ON leaderboard(timestamp);

-- Migration: Add category column to existing leaderboard table (run this if table already exists)
ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS category VARCHAR(200) DEFAULT 'Unknown';

CREATE INDEX IF NOT EXISTS idx_json_documents_name ON json_documents(name);
CREATE INDEX IF NOT EXISTS idx_json_documents_updated_at ON json_documents(updated_at);

-- Enable Row Level Security (RLS)
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE json_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for leaderboard (public access)
CREATE POLICY "Allow public read access" 
ON leaderboard FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Allow public insert access" 
ON leaderboard FOR INSERT 
TO public 
WITH CHECK (true);

CREATE POLICY "Allow public delete access" 
ON leaderboard FOR DELETE 
TO public 
USING (true);

-- Create policies for json_documents (public access)
CREATE POLICY "Allow all operations on json_documents" 
ON json_documents FOR ALL 
TO public 
USING (true);

-- Insert initial empty documents if they don't exist
INSERT INTO json_documents (name, content) 
SELECT 'event_data', '{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM json_documents WHERE name = 'event_data');

INSERT INTO json_documents (name, content) 
SELECT 'chatbot_data', '{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM json_documents WHERE name = 'chatbot_data');
```

## Setup Steps

1. Create a new Supabase project at https://supabase.com
2. Go to Settings > API to get your project URL and anon key
3. Run the SQL schema above in the SQL Editor
4. Set the environment variables in your deployment platform
5. Deploy your application

## Data Storage

The application uses Supabase for storing:

1. **Leaderboard Data**: Structured data in a `leaderboard` table with individual entries
2. **Event Data**: JSON document stored in `json_documents` table with name 'event_data'
3. **Chatbot Data**: JSON document stored in `json_documents` table with name 'chatbot_data'

## Fallback Behavior

If Supabase is not available or not configured:
- The system will automatically fall back to file-based storage
- No data loss will occur
- The application will continue to function normally
- Files are stored in `server/data/` directory

## Testing the Integration

1. Check server logs for "Supabase initialized successfully" or "using file system fallback"
2. Test leaderboard operations through the application
3. Test event data loading and updates
4. Test chatbot responses 
5. Verify data persistence across server restarts/deployments