import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AdminLogout from './AdminLogout';

function ChatAnswersForm() {
  const navigate = useNavigate();
  const [jsonData, setJsonData] = useState('');
  const [vulnerabilityData, setVulnerabilityData] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load initial chatbot data and vulnerability data
    const loadData = async () => {
      try {
        // Load chatbot data
        const chatbotResponse = await fetch('/api/chatbot-data');
        const chatbotData = await chatbotResponse.json();
        setJsonData(JSON.stringify(chatbotData, null, 2));

        // Load vulnerability data
        try {
          const vulnerabilityResponse = await fetch('/api/vulnerability-data');
          const vulnerabilityData = await vulnerabilityResponse.json();
          setVulnerabilityData(JSON.stringify(vulnerabilityData, null, 2));
        } catch (error) {
          // If no vulnerability data exists, set default structure
          const defaultVulnerabilityData = {
            vulnerabilities: [
              {
                keywords: ["example vulnerability", "test"],
                description: "This is an example vulnerability entry"
              }
            ]
          };
          setVulnerabilityData(JSON.stringify(defaultVulnerabilityData, null, 2));
        }
      } catch (error) {
        toast.error('Error loading data', {
          style: {
            border: '1px solid #dc2626',
            padding: '16px',
            color: '#dc2626',
            backgroundColor: '#FEF2F2',
          },
          iconTheme: {
            primary: '#dc2626',
            secondary: '#FFFFFF',
          },
        });
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      // Validate chatbot JSON
      const parsedChatbotData = JSON.parse(jsonData);
      
      // Validate chatbot structure
      if (!parsedChatbotData.responses || !Array.isArray(parsedChatbotData.responses)) {
        throw new Error('Invalid format: missing or invalid responses array');
      }

      if (!parsedChatbotData.fallback) {
        throw new Error('Invalid format: missing fallback message');
      }

      // Validate each response object
      parsedChatbotData.responses.forEach((response, index) => {
        if (!response.keywords || !Array.isArray(response.keywords)) {
          throw new Error(`Response ${index + 1}: missing or invalid keywords array`);
        }
        if (!response.answer && !response.answers) {
          throw new Error(`Response ${index + 1}: missing answer or answers`);
        }
      });

      // Validate vulnerability JSON
      const parsedVulnerabilityData = JSON.parse(vulnerabilityData);
      
      if (!parsedVulnerabilityData.vulnerabilities || !Array.isArray(parsedVulnerabilityData.vulnerabilities)) {
        throw new Error('Invalid vulnerability format: missing or invalid vulnerabilities array');
      }

      // Validate each vulnerability object
      parsedVulnerabilityData.vulnerabilities.forEach((vulnerability, index) => {
        if (!vulnerability.keywords || !Array.isArray(vulnerability.keywords)) {
          throw new Error(`Vulnerability ${index + 1}: missing or invalid keywords array`);
        }
        
        // Support both 'description' and 'category' fields for backward compatibility
        const hasDescription = vulnerability.description && typeof vulnerability.description === 'string';
        const hasCategory = vulnerability.category && typeof vulnerability.category === 'string';
        
        if (!hasDescription && !hasCategory) {
          throw new Error(`Vulnerability ${index + 1}: missing description or category field`);
        }
      });

      // Save chatbot data to server/Supabase
      const chatbotResponse = await fetch('/api/chatbot-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedChatbotData),
      });

      if (!chatbotResponse.ok) {
        throw new Error('Failed to save chatbot data to server');
      }

      // Save vulnerability data to server/Supabase
      const vulnerabilityResponse = await fetch('/api/vulnerability-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedVulnerabilityData),
      });

      if (!vulnerabilityResponse.ok) {
        throw new Error('Failed to save vulnerability data to server');
      }

      // Save to localStorage as backup
      localStorage.setItem('chatbotData', JSON.stringify(parsedChatbotData));
      localStorage.setItem('vulnerabilityData', JSON.stringify(parsedVulnerabilityData));
      
      toast.success('Successfully updated chatbot responses and vulnerabilities!', {
        style: {
          border: '1px solid #10B981',
          padding: '16px',
          color: '#059669',
          backgroundColor: '#F0FDF4',
        },
        iconTheme: {
          primary: '#10B981',
          secondary: '#FFFFFF',
        },
      });
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Invalid JSON format', {
        style: {
          border: '1px solid #dc2626',
          padding: '16px',
          color: '#dc2626',
          backgroundColor: '#FEF2F2',
        },
        iconTheme: {
          primary: '#dc2626',
          secondary: '#FFFFFF',
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 py-8 min-h-full">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-serif font-bold text-gray-900">Edit Chatbot Responses</h1>
            <AdminLogout />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="jsonInput" 
                className="block text-sm font-medium text-gray-700 mb-2 font-serif"
              >
                Chatbot Responses (JSON)
              </label>
              <div className="relative">
                <textarea
                  id="jsonInput"
                  required
                  rows={20}
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  className="w-full font-mono text-sm p-4 border rounded-lg focus:ring-2 focus:ring-offset-2"
                  style={{ 
                    backgroundColor: '#f4efe7',
                    borderColor: '#8f5a39',
                    '--tw-ring-color': '#8f5a39'
                  }}
                  placeholder="Paste your JSON here..."
                />
              </div>
              <p className="mt-2 text-sm text-gray-500 font-serif">
                Format: {`{ "responses": [{ "keywords": ["word1", "word2"], "answer": "response", "triggerBreakBot": false }], "fallback": "message" }`}
              </p>
            </div>

            <div>
              <label 
                htmlFor="vulnerabilityInput" 
                className="block text-sm font-medium text-gray-700 mb-2 font-serif"
              >
                Vulnerabilities (JSON)
              </label>
              <div className="relative">
                <textarea
                  id="vulnerabilityInput"
                  required
                  rows={12}
                  value={vulnerabilityData}
                  onChange={(e) => setVulnerabilityData(e.target.value)}
                  className="w-full font-mono text-sm p-4 border rounded-lg focus:ring-2 focus:ring-offset-2"
                  style={{ 
                    backgroundColor: '#fef3f3',
                    borderColor: '#dc2626',
                    '--tw-ring-color': '#dc2626'
                  }}
                  placeholder="Paste vulnerability keywords JSON here..."
                />
              </div>
              <p className="mt-2 text-sm text-gray-500 font-serif">
                Format: {`{ "vulnerabilities": [{ "keywords": ["hack", "exploit"], "description": "Security vulnerability" }] }`}
              </p>
              <p className="mt-1 text-xs text-gray-500 font-serif">
                💡 You can use either "description" or "category" field for vulnerability information.
              </p>
              <p className="mt-1 text-xs text-red-600 font-serif">
                ⚠️ If any keyword from vulnerabilities is detected, the bot will trigger break mode immediately.
              </p>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 font-serif"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-colors font-serif disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#8f5a39' }}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChatAnswersForm;