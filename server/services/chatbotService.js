const nlp = require('compromise');
const natural = require('natural');
const Fuse = require('fuse.js');
const DataService = require('./dataService');

class ChatbotService {
  constructor() {
    this.chatbotData = null;
    this.vulnerabilityData = null;
    this.fuse = null;
    this.stemmer = natural.PorterStemmer;
    this.initializeService();
  }

  async initializeService() {
    try {
      await this.loadChatbotData();
      await this.loadVulnerabilityData();
      this.setupFuzzySearch();
    } catch (error) {
      console.error('Error initializing chatbot service:', error);
    }
  }

  async loadChatbotData() {
    try {
      this.chatbotData = await DataService.getChatbotData();
    } catch (error) {
      console.error('Error loading chatbot data:', error);
      // Fallback to empty data structure
      this.chatbotData = { responses: [], fallback: "I'm sorry, I couldn't understand that." };
    }
  }

  async loadVulnerabilityData() {
    try {
      this.vulnerabilityData = await DataService.getVulnerabilityData();
    } catch (error) {
      console.error('Error loading vulnerability data:', error);
      // Fallback to empty data structure
      this.vulnerabilityData = { vulnerabilities: [] };
    }
  }

  setupFuzzySearch() {
    if (!this.chatbotData || !this.chatbotData.responses) return;

    // Create searchable items from keywords
    const searchableItems = [];
    this.chatbotData.responses.forEach((response, responseIndex) => {
      response.keywords.forEach((keyword, keywordIndex) => {
        searchableItems.push({
          keyword: keyword.toLowerCase(),
          responseIndex,
          keywordIndex,
          stemmedKeyword: this.stemmer.stem(keyword.toLowerCase())
        });
      });
    });

    // Configure Fuse.js for fuzzy searching
    const fuseOptions = {
      keys: ['keyword', 'stemmedKeyword'],
      threshold: 0.4, // Controls fuzziness (0 = exact match, 1 = match anything)
      distance: 100,
      minMatchCharLength: 2,
      includeScore: true,
      ignoreLocation: true
    };

    this.fuse = new Fuse(searchableItems, fuseOptions);
  }

  /**
   * Lemmatize text using compromise library
   * @param {string} text - Input text to lemmatize
   * @returns {string[]} - Array of lemmatized words
   */
  lemmatizeText(text) {
    try {
      const doc = nlp(text.toLowerCase());
      
      // Get root forms of words
      const lemmatized = [];
      
      // Extract nouns in singular form
      doc.nouns().toSingular().out('array').forEach(word => {
        lemmatized.push(word);
      });
      
      // Extract verbs in infinitive form
      doc.verbs().toInfinitive().out('array').forEach(word => {
        lemmatized.push(word);
      });
      
      // Extract adjectives
      doc.adjectives().out('array').forEach(word => {
        lemmatized.push(word);
      });
      
      // Add other words that weren't captured above
      const allWords = doc.out('array');
      const processedWords = new Set([...lemmatized]);
      
      allWords.forEach(word => {
        if (!processedWords.has(word) && word.length > 2) {
          lemmatized.push(word);
        }
      });
      
      return lemmatized.length > 0 ? lemmatized : [text.toLowerCase()];
    } catch (error) {
      console.error('Error in lemmatization:', error);
      return [text.toLowerCase()];
    }
  }

  /**
   * Perform fuzzy search on keywords
   * @param {string} userMessage - User's input message
   * @returns {Object|null} - Best match result or null
   */
  fuzzySearch(userMessage) {
    if (!this.fuse) return null;
    
    const lemmatizedWords = this.lemmatizeText(userMessage);
    const searchQuery = lemmatizedWords.join(' ');
    
    // Search for each lemmatized word
    let bestMatch = null;
    let bestScore = 1; // Lower score is better in Fuse.js
    
    // Try searching with the full lemmatized query first
    const fullResults = this.fuse.search(searchQuery);
    if (fullResults.length > 0 && fullResults[0].score < bestScore) {
      bestMatch = fullResults[0];
      bestScore = fullResults[0].score;
    }
    
    // Also try searching individual lemmatized words
    lemmatizedWords.forEach(word => {
      const results = this.fuse.search(word);
      if (results.length > 0 && results[0].score < bestScore) {
        bestMatch = results[0];
        bestScore = results[0].score;
      }
    });
    
    // Return the best match if it's good enough
    return bestScore < 0.6 ? bestMatch : null;
  }

  /**
   * Check if user message contains vulnerability keywords (exact matching only)
   * @param {string} userMessage - User's input message
   * @returns {Object|null} - Vulnerability match or null
   */
  checkVulnerabilities(userMessage) {
    if (!this.vulnerabilityData || !this.vulnerabilityData.vulnerabilities) {
      return null;
    }

    const lowerMessage = userMessage.toLowerCase();
    
    // Check each vulnerability for exact keyword matches
    for (const vulnerability of this.vulnerabilityData.vulnerabilities) {
      if (vulnerability.keywords && Array.isArray(vulnerability.keywords)) {
        for (const keyword of vulnerability.keywords) {
          if (lowerMessage.includes(keyword.toLowerCase())) {
            return {
              matched: true,
              keyword: keyword,
              description: vulnerability.description || vulnerability.category || 'Vulnerability detected',
              vulnerabilityData: vulnerability
            };
          }
        }
      }
    }
    
    return null;
  }

  /**
   * Process user message and return appropriate response
   * @param {string} userMessage - User's input message
   * @returns {Object} - Response object with text and metadata
   */
  async processMessage(userMessage) {
    try {
      // Ensure we have the latest data
      if (!this.chatbotData) {
        await this.loadChatbotData();
        this.setupFuzzySearch();
      }
      if (!this.vulnerabilityData) {
        await this.loadVulnerabilityData();
      }

      const originalMessage = userMessage.trim();
      const lowerMessage = originalMessage.toLowerCase();
      
      // FIRST: Check for vulnerabilities (exact matching only, no fuzzy search)
      const vulnerabilityMatch = this.checkVulnerabilities(originalMessage);
      if (vulnerabilityMatch) {
        // Return break bot response immediately
        return {
          text: "🎉 Congratulations! You've unlocked a hidden mode — Break the Bot! The system will now enter debug mode for testing purposes.",
          matchType: 'vulnerability',
          matchedKeyword: vulnerabilityMatch.keyword,
          vulnerabilityDescription: vulnerabilityMatch.description,
          triggerBreakBot: true,
          originalMessage
        };
      }
      
      // SECOND: Try exact keyword matching in normal chat responses
      const exactMatch = this.chatbotData.responses.find(response =>
        response.keywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()))
      );

      if (exactMatch) {
        return this.formatResponse(exactMatch, originalMessage, 'exact');
      }

      // THIRD: Try fuzzy search with lemmatization (only for normal chat, not vulnerabilities)
      const fuzzyMatch = this.fuzzySearch(originalMessage);
      
      if (fuzzyMatch) {
        const matchedResponse = this.chatbotData.responses[fuzzyMatch.item.responseIndex];
        const matchedKeyword = fuzzyMatch.item.keyword;
        
        return this.formatResponse(
          matchedResponse, 
          originalMessage, 
          'fuzzy', 
          matchedKeyword,
          fuzzyMatch.score
        );
      }

      // Return fallback response
      return {
        text: this.chatbotData.fallback || "I'm sorry, I don't have information about that.",
        matchType: 'fallback',
        triggerBreakBot: false,
        originalMessage
      };

    } catch (error) {
      console.error('Error processing message:', error);
      return {
        text: "I'm experiencing some technical difficulties. Please try again.",
        matchType: 'error',
        triggerBreakBot: false,
        originalMessage: userMessage
      };
    }
  }

  /**
   * Format response with randomization and metadata
   * @param {Object} response - Matched response object
   * @param {string} originalMessage - User's original message
   * @param {string} matchType - Type of match (exact/fuzzy)
   * @param {string} matchedKeyword - The keyword that was matched (for fuzzy)
   * @param {number} fuzzyScore - Confidence score for fuzzy matches
   * @returns {Object} - Formatted response object
   */
  formatResponse(response, originalMessage, matchType, matchedKeyword = null, fuzzyScore = null) {
    let responseText;
    
    // Handle multiple answers with randomization (new format)
    if (Array.isArray(response.answers) && response.answers.length > 0) {
      // Pick a random answer from the array
      const randomIndex = Math.floor(Math.random() * response.answers.length);
      responseText = response.answers[randomIndex];
    } else if (response.answer) {
      // Fallback to single answer field (old format - backward compatibility)
      responseText = response.answer;
    } else {
      // Ultimate fallback
      responseText = "I found something, but I'm not sure how to respond.";
    }

    // Add fuzzy match acknowledgment for unclear matches
    if (matchType === 'fuzzy' && fuzzyScore > 0.3) {
      const prefixes = [
        `I think you meant "${matchedKeyword}". `,
        `I understood you were asking about "${matchedKeyword}". `,
        `Based on your question about "${matchedKeyword}": `,
        `I believe you're asking about "${matchedKeyword}". `
      ];
      const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      responseText = randomPrefix + responseText;
    }

    return {
      text: responseText,
      matchType,
      matchedKeyword,
      fuzzyScore,
      triggerBreakBot: response.triggerBreakBot || false,
      originalMessage
    };
  }

  /**
   * Refresh chatbot data and vulnerability data (useful when data is updated)
   */
  async refreshData() {
    await this.loadChatbotData();
    await this.loadVulnerabilityData();
    this.setupFuzzySearch();
  }
}

// Export singleton instance
module.exports = new ChatbotService();