const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

let supabase = null;
let isSupabaseAvailable = false;

// Initialize Supabase client
const initializeSupabase = async () => {
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.log('Supabase credentials not found, using file system fallback');
      return false;
    }

    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Test connection by trying to fetch from a test table or any existing table
    await supabase.from('leaderboard').select('count', { count: 'exact', head: true });
    
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