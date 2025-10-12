const fs = require('fs').promises;
const path = require('path');
const { getSupabaseClient, isSupabaseReady } = require('../config/supabase');

const DATA_FILE = path.join(__dirname, '..', 'data', 'data.json');
const CHATBOT_FILE = path.join(__dirname, '..', 'data', 'chatbotData.json');

// Helper function to preserve object key order
const preserveKeyOrder = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(preserveKeyOrder);
  } else if (obj !== null && typeof obj === 'object') {
    // Create a new object with preserved key order
    const orderedObj = {};
    
    // Define the desired key order for different object types
    const keyOrders = {
      // For event row objects
      eventRow: ['Start', 'End', 'Category', 'Topic', 'Speakers'],
      // For event data objects
      eventData: ['title', 'subtitle', 'date', 'venue', 'email', 'feedbackLink', 'rows', 'speakers'],
      // For chatbot response objects  
      chatbotResponse: ['keywords', 'answer', 'triggerBreakBot'],
      // For main chatbot data
      chatbotData: ['responses', 'fallback']
    };
    
    // Determine object type and apply appropriate ordering
    const keys = Object.keys(obj);
    let orderedKeys = keys;
    
    // Check if this is an event row (has Start/End)
    if (keys.includes('Start') && keys.includes('End')) {
      orderedKeys = keyOrders.eventRow.filter(key => keys.includes(key))
        .concat(keys.filter(key => !keyOrders.eventRow.includes(key)));
    }
    // Check if this is event data (has title/subtitle)
    else if (keys.includes('title') && keys.includes('subtitle')) {
      orderedKeys = keyOrders.eventData.filter(key => keys.includes(key))
        .concat(keys.filter(key => !keyOrders.eventData.includes(key)));
    }
    // Check if this is a chatbot response (has keywords/answer)
    else if (keys.includes('keywords') && keys.includes('answer')) {
      orderedKeys = keyOrders.chatbotResponse.filter(key => keys.includes(key))
        .concat(keys.filter(key => !keyOrders.chatbotResponse.includes(key)));
    }
    // Check if this is main chatbot data (has responses/fallback)
    else if (keys.includes('responses') && keys.includes('fallback')) {
      orderedKeys = keyOrders.chatbotData.filter(key => keys.includes(key))
        .concat(keys.filter(key => !keyOrders.chatbotData.includes(key)));
    }
    
    // Build ordered object
    orderedKeys.forEach(key => {
      orderedObj[key] = preserveKeyOrder(obj[key]);
    });
    
    return orderedObj;
  }
  return obj;
};

class DataService {
  // Get event data
  static async getEventData() {
    try {
      if (isSupabaseReady()) {
        console.log('Fetching event data from Supabase');
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('json_documents')
          .select('content, content_ordered')
          .eq('doc_type', 'event')
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
        
        // Use ordered content if available, otherwise fall back to JSONB content
        if (data.content_ordered) {
          try {
            return JSON.parse(data.content_ordered);
          } catch (parseError) {
            console.log('Error parsing ordered content, using JSONB:', parseError.message);
            return data.content;
          }
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
        
        // Preserve key order before saving
        const orderedEventData = preserveKeyOrder(eventData);
        
        // Use upsert with proper conflict resolution
        const { error } = await supabase
          .from('json_documents')
          .upsert({
            doc_type: 'event',
            content: eventData,
            content_ordered: JSON.stringify(orderedEventData, null, 2),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'doc_type'
          });

        if (error) {
          console.log('Supabase upsert error:', error);
          throw error;
        }
        
        console.log('✅ Successfully saved event data to Supabase');
        
        // Also save to file as backup with preserved order
        await this.saveEventDataToFile(orderedEventData);
        return true;
      } else {
        console.log('Saving event data to file system');
        return await this.saveEventDataToFile(preserveKeyOrder(eventData));
      }
    } catch (error) {
      console.log('Error saving event data to Supabase, falling back to file:', {
        message: error.message,
        details: error.stack,
        hint: error.hint || '',
        code: error.code || ''
      });
      return await this.saveEventDataToFile(preserveKeyOrder(eventData));
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
          .select('content, content_ordered')
          .eq('doc_type', 'chatbot')
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
        
        // Use ordered content if available, otherwise fall back to JSONB content
        if (data.content_ordered) {
          try {
            return JSON.parse(data.content_ordered);
          } catch (parseError) {
            console.log('Error parsing ordered content, using JSONB:', parseError.message);
            return data.content;
          }
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
        
        // Preserve key order before saving
        const orderedChatbotData = preserveKeyOrder(chatbotData);
        
        // Use upsert with proper conflict resolution
        const { error } = await supabase
          .from('json_documents')
          .upsert({
            doc_type: 'chatbot',
            content: chatbotData,
            content_ordered: JSON.stringify(orderedChatbotData, null, 2),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'doc_type'
          });

        if (error) {
          console.log('Supabase upsert error:', error);
          throw error;
        }
        
        console.log('✅ Successfully saved chatbot data to Supabase');
        
        // Also save to file as backup with preserved order
        await this.saveChatbotDataToFile(orderedChatbotData);
        return true;
      } else {
        console.log('Saving chatbot data to file system');
        return await this.saveChatbotDataToFile(preserveKeyOrder(chatbotData));
      }
    } catch (error) {
      console.log('Error saving chatbot data to Supabase, falling back to file:', {
        message: error.message,
        details: error.stack,
        hint: error.hint || '',
        code: error.code || ''
      });
      return await this.saveChatbotDataToFile(preserveKeyOrder(chatbotData));
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
      // Ensure key order is preserved when writing to file
      const orderedData = preserveKeyOrder(eventData);
      await fs.writeFile(tempFile, JSON.stringify(orderedData, null, 2));
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
      // Ensure key order is preserved when writing to file
      const orderedData = preserveKeyOrder(chatbotData);
      await fs.writeFile(tempFile, JSON.stringify(orderedData, null, 2));
      await fs.rename(tempFile, CHATBOT_FILE);
      return true;
    } catch (error) {
      console.log('Error saving chatbot data to file:', error.message);
      return false;
    }
  }
}

module.exports = DataService;