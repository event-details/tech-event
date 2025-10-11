import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

function ConsentModal({ isOpen, onClose, onAgree }) {
  const handleAgree = () => {
    onAgree();
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all" style={{ border: '1px solid #f4efe7' }}>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: '#f4efe7' }}
                    >
                      <ShieldCheckIcon className="w-6 h-6" style={{ color: '#8f5a39' }} />
                    </div>
                    <div>
                      <Dialog.Title
                        as="h3"
                        className="text-xl font-bold leading-6"
                        style={{ color: '#8f5a39' }}
                      >
                        Privacy Notice
                      </Dialog.Title>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-8">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      By continuing, you consent to this website collecting limited personal information 
                      (such as your name or contact details) solely for participation, leaderboard display, 
                      and event-related communication.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      Your data will be used responsibly and not shared with third parties.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 text-sm font-medium rounded-xl border-2 transition-all duration-200 hover:scale-105"
                    style={{ 
                      color: '#8f5a39',
                      backgroundColor: 'white',
                      borderColor: '#f4efe7'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAgree}
                    className="flex-1 px-6 py-3 text-sm font-semibold text-white rounded-xl border-2 border-transparent transition-all duration-200 hover:scale-105"
                    style={{ backgroundColor: '#8f5a39' }}
                  >
                    I Agree
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default ConsentModal;