-- SQL script to create the json_documents table in Supabase
-- This table will store JSON documents with versioning support

CREATE TABLE IF NOT EXISTS json_documents (
  id SERIAL PRIMARY KEY,
  doc_type VARCHAR(50) UNIQUE NOT NULL,
  content JSONB NOT NULL,
  content_ordered TEXT, -- Store JSON as text to preserve key order
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_json_documents_doc_type ON json_documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_json_documents_updated_at ON json_documents(updated_at);

-- Enable Row Level Security (RLS)
ALTER TABLE json_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS (adjust based on your authentication needs)
-- For now, allowing all operations with anon key
CREATE POLICY IF NOT EXISTS "Allow all operations" ON json_documents
  FOR ALL USING (true);

-- Insert initial data if it doesn't exist
INSERT INTO json_documents (doc_type, content) 
SELECT 'event', '{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM json_documents WHERE doc_type = 'event');

INSERT INTO json_documents (doc_type, content) 
SELECT 'chatbot', '{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM json_documents WHERE doc_type = 'chatbot');