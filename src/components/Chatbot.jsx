import React, { useState, useEffect, useRef, Fragment, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { ChatBubbleLeftRightIcon, XMarkIcon } from '@heroicons/react/24/outline';

const BreakBotModal = lazy(() => import('./BreakBotModal.jsx'));

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showBreakBot, setShowBreakBot] = useState(false);
  const [chatbotData, setChatbotData] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Load chatbot data from localStorage or fallback to json file
    const loadChatbotData = async () => {
      try {
        const storedData = localStorage.getItem('chatbotData');
        if (storedData) {
          setChatbotData(JSON.parse(storedData));
        } else {
          const response = await import('../chatbotData.json');
          setChatbotData(response.default);
        }
      } catch (error) {
        console.error('Error loading chatbot data:', error);
      }
    };
    loadChatbotData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      // Only reset input when chat is closed
      setInput('');
    }
  }, [isOpen]);

  const processMessage = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    if (!chatbotData) return null;

    // Check for matches in responses
    const matchedResponse = chatbotData.responses.find(response =>
      response.keywords.some(keyword => message.includes(keyword.toLowerCase()))
    );

    if (matchedResponse) {
      if (matchedResponse.triggerBreakBot) {
        // Show response first, then close chat and show break bot modal
        setTimeout(() => {
          setIsOpen(false);
          setTimeout(() => {
            setShowBreakBot(true);
          }, 100); // Wait for chat close animation
        }, 200); // Wait for response to be shown
      }
      return matchedResponse.answer;
    }

    return chatbotData.fallback;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');

    // Add user message
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);

    // Process and add bot response
    const botResponse = processMessage(userMessage);
    if (botResponse) {
      setTimeout(() => {
        setMessages(prev => [...prev, { text: botResponse, isUser: false }]);
      }, 500);
    }
  };

  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{ backgroundColor: '#8f5a39' }}
        className="fixed bottom-4 right-4 text-white rounded-full p-4 shadow-lg hover:opacity-90 transition-colors"
        aria-label="Open chat"
      >
        <ChatBubbleLeftRightIcon className="h-6 w-6" />
      </button>

      {/* Chat modal */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => setIsOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <Dialog.Title as="h3" className="text-xl font-medium text-gray-900">
                    Event Assistant
                  </Dialog.Title>
                  {/* <Link
                    to="/chatanswers"
                    className="text-sm hover:opacity-80 transition-opacity"
                    style={{ color: '#8f5a39' }}
                  >
                    Edit Responses
                  </Link> */}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>          
            
                 {/* Messages container */}
                  <div className="h-96 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
                    {messages.map((message, idx) => (
                      <div
                        key={idx}
                        className={`mb-4 ${
                          message.isUser ? 'text-right' : 'text-left'
                        }`}
                      >
                        <div
                          className={`inline-block p-3 rounded-lg ${
                            message.isUser
                              ? 'text-white'
                              : 'bg-white text-gray-900 shadow'
                          }`}
                          style={message.isUser ? { backgroundColor: '#8f5a39' } : undefined}
                        >
                          {message.text}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input form */}
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': '#8f5a39' }}
                      ref={inputRef}
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
                      style={{ backgroundColor: '#8f5a39' }}
                    >
                      Send
                    </button>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Break bot modal */}
      <Suspense fallback={<div>Loading...</div>}>
        <BreakBotModal
          isOpen={showBreakBot}
          onClose={() => setShowBreakBot(false)}
          prompt="break the bot"
        />
      </Suspense>
    </>
  );
}

export default Chatbot;