-- SQL script to create the json_documents table in Supabase
-- This table will store JSON documents with versioning support

CREATE TABLE IF NOT EXISTS json_documents (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  content JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_json_documents_name ON json_documents(name);
CREATE INDEX IF NOT EXISTS idx_json_documents_updated_at ON json_documents(updated_at);

-- Enable Row Level Security (RLS)
ALTER TABLE json_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS (adjust based on your authentication needs)
-- For now, allowing all operations with anon key
CREATE POLICY IF NOT EXISTS "Allow all operations" ON json_documents
  FOR ALL USING (true);

-- Insert initial data if it doesn't exist
INSERT INTO json_documents (name, content) 
SELECT 'event_data', '{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM json_documents WHERE name = 'event_data');

INSERT INTO json_documents (name, content) 
SELECT 'chatbot_data', '{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM json_documents WHERE name = 'chatbot_data');