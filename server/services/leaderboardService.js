const fs = require('fs').promises;
const path = require('path');
const { getSupabaseClient, isSupabaseReady } = require('../config/supabase');

const LEADERBOARD_FILE = path.join(__dirname, '..', 'data', 'leaderboardData.json');

class LeaderboardService {
  // Get all leaderboard entries
  static async getLeaderboard() {
    try {
      if (isSupabaseReady()) {
        console.log('Fetching leaderboard from Supabase');
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('leaderboard')
          .select('*')
          .order('timestamp', { ascending: true });

        if (error) throw error;
        
        return { leaderboard: data || [] };
      } else {
        console.log('Fetching leaderboard from file system');
        return await this.getLeaderboardFromFile();
      }
    } catch (error) {
      console.error('Error fetching leaderboard from Supabase, falling back to file:', error);
      return await this.getLeaderboardFromFile();
    }
  }

  // Add new entry to leaderboard
  static async addLeaderboardEntry(entry) {
    try {
      if (isSupabaseReady()) {
        console.log('Adding leaderboard entry to Supabase');
        const supabase = getSupabaseClient();
        
        // Check if vulnerability already exists for the same name
        const { data: existingEntries, error: checkError } = await supabase
          .from('leaderboard')
          .select('*')
          .eq('name', entry.name)
          .eq('vulnerability', entry.vulnerability);

        if (checkError) throw checkError;

        if (existingEntries && existingEntries.length > 0) {
          throw new Error('Vulnerability already submitted with your name once.');
        }

        // Insert new entry
        const { data, error } = await supabase
          .from('leaderboard')
          .insert([{
            name: entry.name,
            mode: entry.mode,
            vulnerability: entry.vulnerability,
            prompt: entry.prompt || entry.vulnerability,
            timestamp: entry.timestamp || new Date().toISOString()
          }])
          .select();

        if (error) throw error;

        return { ok: true, entry: data[0] };
      } else {
        console.log('Adding leaderboard entry to file system');
        return await this.addLeaderboardEntryToFile(entry);
      }
    } catch (error) {
      if (error.message.includes('Vulnerability already submitted')) {
        throw error; // Re-throw validation errors
      }
      console.error('Error adding leaderboard entry to Supabase, falling back to file:', error);
      return await this.addLeaderboardEntryToFile(entry);
    }
  }

  // Clear leaderboard
  static async clearLeaderboard() {
    try {
      if (isSupabaseReady()) {
        console.log('Clearing leaderboard in Supabase');
        const supabase = getSupabaseClient();
        const { error } = await supabase
          .from('leaderboard')
          .delete()
          .neq('id', 0); // Delete all entries

        if (error) throw error;

        return { message: 'Leaderboard cleared successfully' };
      } else {
        console.log('Clearing leaderboard in file system');
        return await this.clearLeaderboardFile();
      }
    } catch (error) {
      console.error('Error clearing leaderboard in Supabase, falling back to file:', error);
      return await this.clearLeaderboardFile();
    }
  }

  // File system fallback methods
  static async getLeaderboardFromFile() {
    try {
      const data = await fs.readFile(LEADERBOARD_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.log('Leaderboard file not found, returning empty leaderboard');
      return { leaderboard: [] };
    }
  }

  static async addLeaderboardEntryToFile(entry) {
    try {
      // Read existing leaderboard data
      let leaderboard;
      try {
        const data = await fs.readFile(LEADERBOARD_FILE, 'utf8');
        leaderboard = JSON.parse(data).leaderboard;
      } catch (error) {
        leaderboard = [];
      }

      // Check if vulnerability already exists for the same name
      if (leaderboard.some(existingEntry => 
        existingEntry.name === entry.name && existingEntry.vulnerability === entry.vulnerability)) {
        throw new Error('Vulnerability already submitted with your name once.');
      }

      // Add new entry with timestamp and all fields
      const newEntry = { 
        name: entry.name, 
        mode: entry.mode, 
        vulnerability: entry.vulnerability, 
        prompt: entry.prompt || entry.vulnerability,
        timestamp: entry.timestamp || new Date().toISOString()
      };
      leaderboard.push(newEntry);

      // Sort leaderboard by timestamp in ascending order
      leaderboard.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      // Write to a temporary file first, then rename to ensure atomicity
      const tempFile = `${LEADERBOARD_FILE}.tmp`;
      await fs.writeFile(tempFile, JSON.stringify({ leaderboard }, null, 2));
      await fs.rename(tempFile, LEADERBOARD_FILE);

      return { ok: true, entry: newEntry };
    } catch (error) {
      throw error;
    }
  }

  static async clearLeaderboardFile() {
    try {
      const emptyLeaderboard = { leaderboard: [] };
      await fs.writeFile(LEADERBOARD_FILE, JSON.stringify(emptyLeaderboard, null, 2));
      return { message: 'Leaderboard cleared successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Initialize leaderboard file if it doesn't exist
  static async initializeLeaderboardFile() {
    try {
      await fs.access(LEADERBOARD_FILE);
    } catch (error) {
      // File doesn't exist, create it with initial structure
      await fs.writeFile(LEADERBOARD_FILE, JSON.stringify({ leaderboard: [] }, null, 2));
    }
  }
}

module.exports = LeaderboardService;