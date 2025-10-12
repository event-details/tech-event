import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AdminLogout from './AdminLogout';

function ChatAnswersForm() {
  const navigate = useNavigate();
  const [jsonData, setJsonData] = useState('');

  useEffect(() => {
    // Load initial chatbot data
    const loadChatbotData = async () => {
      try {
        const response = await fetch('/api/chatbot-data');
        const data = await response.json();
        setJsonData(JSON.stringify(data, null, 2));
      } catch (error) {
        toast.error('Error loading chatbot data', {
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
        console.error('Error loading chatbot data:', error);
      }
    };

    loadChatbotData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate JSON
      const parsedData = JSON.parse(jsonData);
      
      // Validate structure
      if (!parsedData.responses || !Array.isArray(parsedData.responses)) {
        throw new Error('Invalid format: missing or invalid responses array');
      }

      if (!parsedData.fallback) {
        throw new Error('Invalid format: missing fallback message');
      }

      // Validate each response object
      parsedData.responses.forEach((response, index) => {
        if (!response.keywords || !Array.isArray(response.keywords)) {
          throw new Error(`Response ${index + 1}: missing or invalid keywords array`);
        }
        if (!response.answer) {
          throw new Error(`Response ${index + 1}: missing answer`);
        }
      });

      // Save to server/Supabase first
      const response = await fetch('/api/chatbot-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedData),
      });

      if (!response.ok) {
        throw new Error('Failed to save to server');
      }

      // Save to localStorage as backup
      localStorage.setItem('chatbotData', JSON.stringify(parsedData));
      
      toast.success('Successfully updated chatbot responses!', {
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
                className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-colors font-serif"
                style={{ backgroundColor: '#8f5a39' }}
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChatAnswersForm;