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
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    // Load chatbot data from localStorage or fallback to json file
    const loadChatbotData = async () => {
      try {
        const storedData = localStorage.getItem('chatbotData');
        if (storedData) {
          setChatbotData(JSON.parse(storedData));
        } else {
          const response = await fetch('/api/chatbot-data');
          const data = await response.json();
          setChatbotData(data);
        }
      } catch (error) {
        console.error('Error loading chatbot data:', error);
      }
    };
    loadChatbotData();
  }, []);

  // Detect mobile device and keyboard
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (!isMobile) return;

    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = viewportHeight - currentHeight;
      
      // Keyboard is likely open if height decreased by more than 150px
      const keyboardOpen = heightDifference > 150;
      setIsKeyboardOpen(keyboardOpen);
      
      if (!keyboardOpen) {
        setViewportHeight(currentHeight);
      }
    };

    const handleFocusIn = () => {
      setTimeout(() => {
        setIsKeyboardOpen(true);
        // Scroll input into view on keyboard open
        setTimeout(() => {
          inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);
      }, 100);
    };

    const handleFocusOut = () => {
      setTimeout(() => {
        setIsKeyboardOpen(false);
        setViewportHeight(window.innerHeight);
      }, 100);
    };

    // iOS specific handling
    if (isIOS) {
      window.addEventListener('resize', handleResize, { passive: true });
      document.addEventListener('focusin', handleFocusIn);
      document.addEventListener('focusout', handleFocusOut);
    } else {
      // Android and other mobile devices
      window.addEventListener('resize', handleResize, { passive: true });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [viewportHeight]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    
    if (isOpen) {
      // Add body class for mobile styling
      if (isMobile) {
        document.body.classList.add('chatbot-open');
      }
      
      // Delay focus to prevent viewport issues
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const delay = isIOS ? 500 : 200;
      
      setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true });
      }, delay);
    } else {
      // Reset input and mobile styles when chat is closed
      setInput('');
      setIsKeyboardOpen(false);
      // Remove body class and reset styles
      document.body.classList.remove('chatbot-open');
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
  }, [isOpen]);

  // Handle iOS viewport adjustments
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (!isIOS) return;

    const handleResize = () => {
      // Force a reflow to handle iOS keyboard behavior
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };

    if (isOpen) {
      handleResize();
      window.addEventListener('resize', handleResize);
      // Prevent background scrolling on iOS
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.style.overflow = '';
    };
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

    // Blur input on mobile to dismiss keyboard
    const isMobile = window.innerWidth < 768;
    if (isMobile && inputRef.current) {
      inputRef.current.blur();
    }

    // Add user message
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);

    // Process and add bot response
    const botResponse = processMessage(userMessage);
    if (botResponse) {
      setTimeout(() => {
        setMessages(prev => [...prev, { text: botResponse, isUser: false }]);
      }, 500);
    }

    // Re-focus input after a short delay for better UX
    if (isMobile) {
      setTimeout(() => {
        if (inputRef.current && isOpen) {
          inputRef.current.focus({ preventScroll: true });
        }
      }, 600);
    }
  };

  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{ backgroundColor: '#8f5a39' }}
        className="fixed bottom-4 right-4 text-white rounded-full p-4 shadow-xl hover:scale-105 transition-all duration-200"
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

          <div className="fixed inset-0 overflow-hidden">
            <div 
              className="flex min-h-full items-end sm:items-center justify-center text-center"
              style={{ 
                padding: isKeyboardOpen ? '0.5rem 0.5rem 0' : '0.5rem',
                paddingBottom: isKeyboardOpen ? '0' : 'max(0.5rem, env(safe-area-inset-bottom))'
              }}
            >
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95 translate-y-4"
                enterTo="opacity-100 scale-100 translate-y-0"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100 translate-y-0"
                leaveTo="opacity-0 scale-95 translate-y-4"
              >
                <Dialog.Panel 
                  ref={chatContainerRef}
                  className="w-full max-w-sm sm:max-w-md transform overflow-hidden bg-white shadow-xl transition-all flex flex-col"
                  style={{ 
                    border: '1px solid #f4efe7',
                    borderRadius: isKeyboardOpen ? '1rem 1rem 0 0' : '1rem',
                    height: isKeyboardOpen 
                      ? `${Math.min(window.innerHeight * 0.7, 500)}px`
                      : 'auto',
                    maxHeight: isKeyboardOpen 
                      ? `${Math.min(window.innerHeight * 0.7, 500)}px`
                      : 'calc(100vh - 2rem)',
                    minHeight: isKeyboardOpen 
                      ? `${Math.min(window.innerHeight * 0.4, 300)}px`
                      : 'min(60vh, 400px)',
                    marginBottom: isKeyboardOpen ? '0' : 'env(safe-area-inset-bottom)',
                    position: isKeyboardOpen ? 'fixed' : 'relative',
                    bottom: isKeyboardOpen ? '0' : 'auto',
                    left: isKeyboardOpen ? '0.5rem' : 'auto',
                    right: isKeyboardOpen ? '0.5rem' : 'auto'
                  }}
                >
                  {/* Header */}
                  <div 
                    className="px-4 sm:px-6 py-3 sm:py-4 border-b flex-shrink-0"
                    style={{ borderColor: '#f4efe7' }}
                  >
                    <div className="flex justify-between items-center">
                      <Dialog.Title as="h3" className="text-lg sm:text-xl font-semibold text-gray-900">
                        Event Assistant
                      </Dialog.Title>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:scale-105"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>          
            
                  {/* Messages container */}
                  <div 
                    className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-b from-gray-50 to-gray-100 min-h-0"
                    style={{
                      WebkitOverflowScrolling: 'touch',
                      maxHeight: isKeyboardOpen ? 'calc(100% - 140px)' : 'none'
                    }}
                  >
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 mt-8">
                        <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm px-4">Hi! I'm here to help with any questions about the event.</p>
                      </div>
                    ) : (
                      messages.map((message, idx) => (
                        <div
                          key={idx}
                          className={`mb-4 ${
                            message.isUser ? 'text-right' : 'text-left'
                          }`}
                        >
                          <div
                            className={`inline-block px-3 sm:px-4 py-2 sm:py-3 rounded-xl break-words ${
                              message.isUser
                                ? 'text-white shadow-md max-w-[85%] sm:max-w-xs'
                                : 'bg-white text-gray-900 shadow-md border max-w-[90%] sm:max-w-sm'
                            }`}
                            style={message.isUser 
                              ? { backgroundColor: '#8f5a39' } 
                              : { borderColor: '#f4efe7' }
                            }
                          >
                            {message.text}
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input form */}
                  <div 
                    className="border-t bg-white flex-shrink-0"
                    style={{ 
                      borderColor: '#f4efe7',
                      padding: isKeyboardOpen ? '12px 16px' : '16px 24px',
                      paddingBottom: isKeyboardOpen 
                        ? '12px' 
                        : `max(0.75rem, calc(0.75rem + env(safe-area-inset-bottom)))`,
                      position: isKeyboardOpen ? 'sticky' : 'relative',
                      bottom: isKeyboardOpen ? '0' : 'auto',
                      zIndex: 10
                    }}
                  >
                    <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none text-gray-900 bg-white text-base"
                        style={{ 
                          borderColor: '#f4efe7',
                          minHeight: '48px',
                          fontSize: '16px', // Prevent zoom on iOS
                          WebkitAppearance: 'none',
                          borderRadius: '12px',
                          WebkitBorderRadius: '12px'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#905a39';
                          // Prevent body scroll when input is focused on mobile
                          if (window.innerWidth < 768) {
                            document.body.style.overflow = 'hidden';
                            document.body.style.position = 'fixed';
                            document.body.style.width = '100%';
                          }
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#f4efe7';
                          // Restore body scroll
                          document.body.style.overflow = '';
                          document.body.style.position = '';
                          document.body.style.width = '';
                        }}
                        ref={inputRef}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="none"
                        spellCheck="false"
                        inputMode="text"
                      />
                      <button
                        type="submit"
                        disabled={!input.trim()}
                        className="px-5 py-3 text-sm font-semibold text-white rounded-xl border-2 border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center touch-manipulation"
                        style={{ 
                          backgroundColor: '#8f5a39',
                          minHeight: '48px',
                          minWidth: '70px',
                          borderRadius: '12px',
                          WebkitBorderRadius: '12px',
                          WebkitAppearance: 'none',
                          WebkitTouchCallout: 'none',
                          WebkitUserSelect: 'none'
                        }}
                        onTouchStart={(e) => {
                          // Improve touch responsiveness
                          e.currentTarget.style.backgroundColor = '#7a4d32';
                        }}
                        onTouchEnd={(e) => {
                          e.currentTarget.style.backgroundColor = '#8f5a39';
                        }}
                      >
                        <span>Send</span>
                      </button>
                    </form>
                  </div>
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