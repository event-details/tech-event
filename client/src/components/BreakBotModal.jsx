import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Select, Transition } from '@headlessui/react';
import { XMarkIcon, TrophyIcon, UserCircleIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import Confetti from 'react-confetti';
import { toast, Toaster } from 'react-hot-toast';

const BreakBotModal = ({ isOpen, onClose, prompt, category }) => {
  const [name, setName] = useState('');
  const [mode, setMode] = useState('Zoom');
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 768);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Map fields to backend requirements
    // Backend expects: name, mode, vulnerability (prompt)
    const submission = {
      name,
      mode,
      vulnerability: prompt,
      category: category || 'Unknown',
    };

    try {
      const apiUrl = process.env.NODE_ENV === 'production'
        ? '/api/leaderboard'
        : 'http://localhost:3001/api/leaderboard';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save to leaderboard');
      }

      setShowConfetti(true);
      toast.success('Successfully added to leaderboard!', {
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
    } catch (error) {
      const errorMessage = error.message || 'Failed to save to leaderboard. Please try again.';
      toast.error(errorMessage, {
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
      return;
    }

  setName('');
  setMode('Zoom');
    setTimeout(() => {
      setShowConfetti(false);
      onClose();
    }, 1000);
  };

  return (
    <>
      <Toaster position="top-center" />
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={200}
          recycle={false}
          colors={['#8f5a39', '#b17349', '#ffd700', '#ffffff']}
        />
      )}
      
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={onClose}
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
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
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
                <Dialog.Panel 
                  className={`transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all
                    ${windowWidth >= 768 ? 'w-full max-w-4xl' : 'w-full max-w-md'}`}
                >
                  {/* Hero Section */}
                  <div className="relative overflow-hidden bg-gradient-to-r from-[#8f5a39] to-[#b17349] p-6 text-white">
                    <div className="absolute top-0 right-0 p-4">
                      <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors"
                        aria-label="Close modal"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-6 py-4">
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <div className="absolute -inset-1 rounded-full bg-white/20 blur-md"></div>
                          <div className="relative bg-white/10 rounded-full p-4 ring-1 ring-white/30">
                            <TrophyIcon className="h-16 w-16 text-yellow-300" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center md:text-left">
                        <Dialog.Title as="h3" className="text-2xl md:text-3xl font-bold mb-2">
                          Congratulations, AI Warrior! 
                        </Dialog.Title>
                        <p className="text-lg md:text-xl text-white/90">
                          You've successfully uncovered a hidden vulnerability.
                        </p>
                    
                      </div>
                    </div>
                  </div>

                  {/* Form Section */}
                  <div className={`p-6 ${windowWidth >= 768 ? 'max-h-[70vh]' : 'max-h-[60vh]'} overflow-y-auto bg-gray-50/50`}>
                    <div className="max-w-2xl mx-auto">
                      <p className="text-gray-600 mb-6 text-lg">
                       Drop your contact details below so we can reach out and celebrate your discovery.
                      </p>
                      
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3 mb-2">
                            <UserCircleIcon className="h-5 w-5 text-[#8f5a39]" />
                            <label
                              htmlFor="name"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Full Name
                            </label>
                          </div>
                          <input
                            type="text"
                            id="name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                            className="mt-1 block w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                            style={{ '--tw-ring-color': '#8f5a39' }}
                          />
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3 mb-2">
                            <DevicePhoneMobileIcon className="h-5 w-5 text-[#8f5a39]" />
                            <label
                              htmlFor="mode"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Where are you joining from?
                            </label>
                          </div>
                          <div className="relative mt-1">
                            <Select
                              id="mode"
                              value={mode}
                              onChange={(e) => setMode(e.target.value)}
                              className="block w-full rounded-lg border border-gray-300 bg-white py-3 px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-[#8f5a39] focus:border-transparent"
                              style={{
                                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                backgroundPosition: 'right 0.5rem center',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '1.5em 1.5em',
                                paddingRight: '2.5rem'
                              }}
                            >
                              <option value="" disabled>Are you attending in person or joining over Zoom?</option>
                              <option value="Zoom" className="py-2">Zoom Meeting</option>
                              <option value="In-person" className="py-2">In-person Meeting</option>
                            </Select>
                          </div>
                        </div>

                        <div className="flex justify-center pt-4">
                          <button
                            type="submit"
                            className="group w-full sm:w-auto px-8 py-3 text-white rounded-lg transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8f5a39] disabled:opacity-50"
                            style={{ 
                              background: 'linear-gradient(to right, #8f5a39, #b17349)',
                              boxShadow: '0 4px 6px -1px rgba(143, 90, 57, 0.2), 0 2px 4px -1px rgba(143, 90, 57, 0.1)'
                            }}
                          >
                            <span className="flex items-center justify-center gap-2">
                              Submit Discovery
                              <TrophyIcon className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

BreakBotModal.displayName = 'BreakBotModal';
export default React.memo(BreakBotModal);