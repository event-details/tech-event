const { createClient } = require('@supabase/supabase-js');

// Supabase configuration - get fresh values each time
const getSupabaseCredentials = () => {
  return {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY
  };
};

let supabase = null;
let isSupabaseAvailable = false;

// Initialize Supabase client
const initializeSupabase = async () => {
  try {
    const { url, key } = getSupabaseCredentials();
    
    if (!url || !key) {
      console.log('Supabase credentials not found, using file system fallback');
      console.log('URL set:', !!url, 'Key set:', !!key);
      return false;
    }

    supabase = createClient(url, key);
    
    // Test connection by trying to fetch from json_documents table
    await supabase.from('json_documents').select('doc_type').limit(1);
    
    isSupabaseAvailable = true;
    console.log('Supabase initialized successfully');
    return true;
  } catch (error) {
    console.log('Supabase initialization failed, using file system fallback:', error.message);
    isSupabaseAvailable = false;
    supabase = null;
    return false;
  }
};

// Get Supabase client
const getSupabaseClient = () => {
  return isSupabaseAvailable ? supabase : null;
};

// Check if Supabase is available
const isSupabaseReady = () => {
  return isSupabaseAvailable;
};

module.exports = {
  initializeSupabase,
  getSupabaseClient,
  isSupabaseReady
};