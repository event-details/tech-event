const fs = require('fs').promises;
const path = require('path');
const { getSupabaseClient, isSupabaseReady } = require('../config/supabase');

const DATA_FILE = path.join(__dirname, '..', 'data', 'data.json');
const CHATBOT_FILE = path.join(__dirname, '..', 'data', 'chatbotData.json');

class DataService {
  // Get event data
  static async getEventData() {
    try {
      if (isSupabaseReady()) {
        console.log('Fetching event data from Supabase');
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('json_documents')
          .select('content')
          .eq('name', 'event_data')
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // No data found, create initial record from file
            console.log('No event data found in Supabase, initializing from file');
            const fileData = await this.getEventDataFromFile();
            await this.saveEventData(fileData);
            return fileData;
          }
          throw error;
        }
        
        return data.content;
      } else {
        console.log('Fetching event data from file system');
        return await this.getEventDataFromFile();
      }
    } catch (error) {
      console.log('Error fetching event data from Supabase, falling back to file:', {
        message: error.message,
        details: error.stack,
        hint: error.hint || '',
        code: error.code || ''
      });
      return await this.getEventDataFromFile();
    }
  }

  // Save event data
  static async saveEventData(eventData) {
    try {
      if (isSupabaseReady()) {
        console.log('Saving event data to Supabase');
        const supabase = getSupabaseClient();
        const { error } = await supabase
          .from('json_documents')
          .upsert({
            name: 'event_data',
            content: eventData,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'name'
          });

        if (error) throw error;
        
        // Also save to file as backup
        await this.saveEventDataToFile(eventData);
        return true;
      } else {
        console.log('Saving event data to file system');
        return await this.saveEventDataToFile(eventData);
      }
    } catch (error) {
      console.log('Error saving event data to Supabase, falling back to file:', {
        message: error.message,
        details: error.stack,
        hint: error.hint || '',
        code: error.code || ''
      });
      return await this.saveEventDataToFile(eventData);
    }
  }

  // Get chatbot data
  static async getChatbotData() {
    try {
      if (isSupabaseReady()) {
        console.log('Fetching chatbot data from Supabase');
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('json_documents')
          .select('content')
          .eq('name', 'chatbot_data')
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // No data found, create initial record from file
            console.log('No chatbot data found in Supabase, initializing from file');
            const fileData = await this.getChatbotDataFromFile();
            await this.saveChatbotData(fileData);
            return fileData;
          }
          throw error;
        }
        
        return data.content;
      } else {
        console.log('Fetching chatbot data from file system');
        return await this.getChatbotDataFromFile();
      }
    } catch (error) {
      console.log('Error fetching chatbot data from Supabase, falling back to file:', {
        message: error.message,
        details: error.stack,
        hint: error.hint || '',
        code: error.code || ''
      });
      return await this.getChatbotDataFromFile();
    }
  }

  // Save chatbot data
  static async saveChatbotData(chatbotData) {
    try {
      if (isSupabaseReady()) {
        console.log('Saving chatbot data to Supabase');
        const supabase = getSupabaseClient();
        const { error } = await supabase
          .from('json_documents')
          .upsert({
            name: 'chatbot_data',
            content: chatbotData,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'name'
          });

        if (error) throw error;
        
        // Also save to file as backup
        await this.saveChatbotDataToFile(chatbotData);
        return true;
      } else {
        console.log('Saving chatbot data to file system');
        return await this.saveChatbotDataToFile(chatbotData);
      }
    } catch (error) {
      console.log('Error saving chatbot data to Supabase, falling back to file:', {
        message: error.message,
        details: error.stack,
        hint: error.hint || '',
        code: error.code || ''
      });
      return await this.saveChatbotDataToFile(chatbotData);
    }
  }

  // File system methods for event data
  static async getEventDataFromFile() {
    try {
      const data = await fs.readFile(DATA_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.log('Error reading event data file:', error.message);
      return { eventData: { title: "Tech Event", rows: [] } };
    }
  }

  static async saveEventDataToFile(eventData) {
    try {
      const tempFile = DATA_FILE + '.tmp';
      await fs.writeFile(tempFile, JSON.stringify(eventData, null, 2));
      await fs.rename(tempFile, DATA_FILE);
      return true;
    } catch (error) {
      console.log('Error saving event data to file:', error.message);
      return false;
    }
  }

  // File system methods for chatbot data
  static async getChatbotDataFromFile() {
    try {
      const data = await fs.readFile(CHATBOT_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.log('Error reading chatbot data file:', error.message);
      return { responses: [], fallback: "I'm sorry, I don't have information about that." };
    }
  }

  static async saveChatbotDataToFile(chatbotData) {
    try {
      const tempFile = CHATBOT_FILE + '.tmp';
      await fs.writeFile(tempFile, JSON.stringify(chatbotData, null, 2));
      await fs.rename(tempFile, CHATBOT_FILE);
      return true;
    } catch (error) {
      console.log('Error saving chatbot data to file:', error.message);
      return false;
    }
  }
}

module.exports = DataService;