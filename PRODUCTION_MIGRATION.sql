-- PRODUCTION MIGRATION SCRIPT
-- Run this in your Supabase SQL Editor to fix the chatbot data issue

-- Step 1: Add category column to leaderboard if it doesn't exist
ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS category VARCHAR(200) DEFAULT 'Unknown';

-- Step 2: Fix json_documents table schema
-- Check if we have the old 'name' column and need to migrate
DO $$
BEGIN
    -- Check if 'name' column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'json_documents' AND column_name = 'name') THEN
        
        -- Rename 'name' to 'doc_type'
        ALTER TABLE json_documents RENAME COLUMN name TO doc_type;
        
        -- Update existing data
        UPDATE json_documents SET doc_type = 'event' WHERE doc_type = 'event_data';
        UPDATE json_documents SET doc_type = 'chatbot' WHERE doc_type = 'chatbot_data';
        
        -- Drop old index and create new one
        DROP INDEX IF EXISTS idx_json_documents_name;
        CREATE INDEX IF NOT EXISTS idx_json_documents_doc_type ON json_documents(doc_type);
        
        RAISE NOTICE 'Successfully migrated json_documents table from name to doc_type';
    ELSE
        RAISE NOTICE 'json_documents table already has doc_type column, no migration needed';
    END IF;
END $$;

-- Step 3: Ensure we have proper initial data
-- Insert chatbot data if it doesn't exist
INSERT INTO json_documents (doc_type, content, content_ordered) 
SELECT 'chatbot', 
       '{"responses":[{"keywords":["hi","hello","hey","greeting","good morning","good afternoon","good evening"],"answers":["Hello! Welcome to TECH MEETUP 25! 🎉","Hi there! Great to see you at our AI Innovation Summit!","Hey! Welcome to the future of AI! 🚀"],"triggerBreakBot":false},{"keywords":["schedule","agenda","program","timeline","when","time"],"answers":["Our exciting agenda includes keynote sessions, AI demos, and networking breaks. Check the main page for the complete schedule!","The event runs from morning to evening with amazing AI presentations and interactive sessions!"],"triggerBreakBot":false},{"keywords":["speaker","speakers","who","presenter","talk"],"answers":["We have amazing AI experts and industry leaders presenting today! Check out our speakers section for detailed profiles.","Our speakers are top AI researchers and innovators. You can find their bios in the speakers section!"],"triggerBreakBot":false},{"keywords":["venue","location","where","address","directions"],"answers":["We are hosted at ETV9, BTC, Bengaluru - a premier tech venue in the heart of India''s Silicon Valley!","The event is at ETV9, BTC, Bengaluru. Perfect location for our AI innovation summit!"],"triggerBreakBot":false},{"keywords":["registration","signup","join","participate","attend"],"answers":["Welcome! You are already part of this amazing AI journey. Enjoy the presentations and network with fellow AI enthusiasts!","Great to have you here! Make sure to participate in our interactive sessions and connect with other attendees."],"triggerBreakBot":false}],"fallback":"I am working in Supabase-only mode. I may not have specific information about that topic, but feel free to explore our event agenda, speakers, or try asking about the schedule, venue, or presentations! 🤖"}',
       '{"responses":[{"keywords":["hi","hello","hey","greeting","good morning","good afternoon","good evening"],"answers":["Hello! Welcome to TECH MEETUP 25! 🎉","Hi there! Great to see you at our AI Innovation Summit!","Hey! Welcome to the future of AI! 🚀"],"triggerBreakBot":false},{"keywords":["schedule","agenda","program","timeline","when","time"],"answers":["Our exciting agenda includes keynote sessions, AI demos, and networking breaks. Check the main page for the complete schedule!","The event runs from morning to evening with amazing AI presentations and interactive sessions!"],"triggerBreakBot":false},{"keywords":["speaker","speakers","who","presenter","talk"],"answers":["We have amazing AI experts and industry leaders presenting today! Check out our speakers section for detailed profiles.","Our speakers are top AI researchers and innovators. You can find their bios in the speakers section!"],"triggerBreakBot":false},{"keywords":["venue","location","where","address","directions"],"answers":["We are hosted at ETV9, BTC, Bengaluru - a premier tech venue in the heart of India''s Silicon Valley!","The event is at ETV9, BTC, Bengaluru. Perfect location for our AI innovation summit!"],"triggerBreakBot":false},{"keywords":["registration","signup","join","participate","attend"],"answers":["Welcome! You are already part of this amazing AI journey. Enjoy the presentations and network with fellow AI enthusiasts!","Great to have you here! Make sure to participate in our interactive sessions and connect with other attendees."],"triggerBreakBot":false}],"fallback":"I am working in Supabase-only mode. I may not have specific information about that topic, but feel free to explore our event agenda, speakers, or try asking about the schedule, venue, or presentations! 🤖"}'
WHERE NOT EXISTS (SELECT 1 FROM json_documents WHERE doc_type = 'chatbot');

-- Step 4: Insert event data if it doesn't exist
INSERT INTO json_documents (doc_type, content, content_ordered) 
SELECT 'event', 
       '{"eventData":{"title":"TECH MEETUP 25","subtitle":"A Marquee AI Event","date":"October 16, 2025","venue":"ETV9, BTC, Bengaluru","email":"avtrixx@gmail.com","feedbackLink":"","rows":[],"speakers":[]}}',
       '{"eventData":{"title":"TECH MEETUP 25","subtitle":"A Marquee AI Event","date":"October 16, 2025","venue":"ETV9, BTC, Bengaluru","email":"avtrixx@gmail.com","feedbackLink":"","rows":[],"speakers":[]}}'
WHERE NOT EXISTS (SELECT 1 FROM json_documents WHERE doc_type = 'event');

-- Step 5: Verify the data
SELECT 'Migration completed successfully!' as status;
SELECT doc_type, 
       CASE 
         WHEN LENGTH(content::text) > 100 THEN LEFT(content::text, 100) || '...' 
         ELSE content::text 
       END as content_preview
FROM json_documents;