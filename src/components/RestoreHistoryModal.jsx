import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';

function RestoreHistoryModal({ isOpen, onClose, onRestore }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const storedHistory = JSON.parse(localStorage.getItem('eventDataHistory') || '[]');
      setHistory(storedHistory);
    }
  }, [isOpen]);

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={onClose}
      >
        <div className="min-h-screen px-4 text-center">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
            <Dialog.Title
              as="h3"
              className="text-lg font-medium leading-6 text-gray-900 mb-4"
            >
              Restore Previous Version
            </Dialog.Title>

            <div className="mt-4 max-h-96 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-gray-500">No previous versions found</p>
              ) : (
                history.map((version, index) => (
                  <button
                    key={version.timestamp}
                    onClick={() => onRestore(version)}
                    className="w-full text-left p-4 hover:bg-gray-50 border-b border-gray-200"
                  >
                    <p className="font-medium text-gray-900">
                      {new Date(version.timestamp).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {version.title} - {version.subtitle}
                    </p>
                  </button>
                ))
              )}
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={onClose}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default RestoreHistoryModal;