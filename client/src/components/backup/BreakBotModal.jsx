import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Confetti from 'react-confetti';
import { toast, Toaster } from 'react-hot-toast';

const BreakBotModal = ({ isOpen, onClose, prompt }) => {
  const [name, setName] = useState('');
  const [mode, setMode] = useState('Zoom');
  const [showConfetti, setShowConfetti] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const submission = {
      name,
      mode,
      prompt,
      timestamp: new Date().toISOString(),
    };

    // Get existing leaderboard or initialize new one
    const existingLeaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    
    // Add new submission
    localStorage.setItem(
      'leaderboard',
      JSON.stringify([...existingLeaderboard, submission])
    );

    // Show success feedback
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
    
    // Reset form
    setName('');
    setMode('Zoom');
    
    // Close modal after delay
    setTimeout(() => {
      setShowConfetti(false);
      onClose();
    }, 3000);
  };

  return (
    <>
      <Toaster position="top-center" />
      {showConfetti && <Confetti numberOfPieces={200} recycle={false} />}
      
      <Transition show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={onClose}
          open={isOpen}
        >
          <div className="min-h-screen px-4 text-center">
            {/* <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" /> */}

            <div className="inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900 mb-4"
              >
                🎉 Congratulations! You broke the bot!
              </Dialog.Title>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="mode"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Mode
                  </label>
                  <select
                    id="mode"
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="Zoom">Zoom</option>
                    <option value="In-person">In-person</option>
                  </select>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

BreakBotModal.displayName = 'BreakBotModal';
export default React.memo(BreakBotModal);