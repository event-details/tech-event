import { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { toast, Toaster } from 'react-hot-toast';
import { XMarkIcon, TrashIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import AdminLogout from './AdminLogout';

function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const entriesPerPage = 10;

  // Load leaderboard data from API
  const fetchLeaderboard = async () => {
    try {
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? '/api/leaderboard'
        : 'http://localhost:3001/api/leaderboard';

      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error('Failed to fetch leaderboard data');
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid content type:', contentType);
        throw new Error('Invalid server response format');
      }

      const data = await response.json();
      if (!data || !Array.isArray(data.leaderboard)) {
        console.error('Invalid data structure:', data);
        throw new Error('Invalid leaderboard data format');
      }

      // Sort by timestamp (oldest first - first submission on top)
      const sortedData = data.leaderboard.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setLeaderboardData(sortedData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboardData([]);
    }
  };

  const handleClearLeaderboard = async () => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NODE_ENV === 'production' 
        ? '/api/leaderboard'
        : 'http://localhost:3001/api/leaderboard';

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to clear leaderboard');
      }

      // Refresh data from server to ensure it's cleared
      await fetchLeaderboard();
      setIsModalOpen(false);
      setPassword('');
      toast.success('Successfully cleared leaderboard!', {
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
      toast.error(error.message, {
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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    // Handle window resize
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const pageCount = Math.ceil(leaderboardData.length / entriesPerPage);
  const currentEntries = leaderboardData.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  return (
    <div className="bg-gradient-to-b from-[#8f5a39]/10 to-transparent flex flex-col min-h-full">
      <div className="flex-grow container mx-auto px-4 py-12 flex flex-col">
        {/* Header Section */}
        <div className="max-w-7xl mx-auto mb-12 w-full relative">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[#8f5a39] mb-4">Bot Breakers Leaderboard</h1>
            <p className="text-gray-600 text-lg mb-2">Celebrating our most innovative AI challengers</p>
          </div>
          <div className="absolute top-0 right-0">
            <AdminLogout />
          </div>
        </div>

      {/* Clear Leaderboard Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="absolute right-0 top-0 pr-4 pt-4">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500"
                      onClick={() => setIsModalOpen(false)}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="flex items-center justify-center mb-4">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                      <ShieldExclamationIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                  </div>

                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-center text-gray-900 mb-4"
                  >
                    Clear Leaderboard
                  </Dialog.Title>

                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-4">
                      Please enter the admin password to clear the leaderboard. This action cannot be undone.
                    </p>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                      placeholder="Enter admin password"
                    />
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      onClick={() => {
                        setIsModalOpen(false);
                        setPassword('');
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      onClick={handleClearLeaderboard}
                      disabled={!password || isLoading}
                    >
                      {isLoading ? 'Clearing...' : 'Clear Leaderboard'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Leaderboard Content */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-[#8f5a39]/10">
        {isMobile ? (
          // Mobile view - cards
          <div className="divide-y divide-[#8f5a39]/10">
            {currentEntries.map((entry, index) => (
              <div
                key={entry.timestamp}
                className="p-6 hover:bg-[#8f5a39]/5 transition-colors"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-[#8f5a39]/10 text-[#8f5a39] font-bold text-lg">
                    #{(currentPage - 1) * entriesPerPage + index + 1}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-lg text-gray-900">{entry.name}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-[#8f5a39]">{entry.mode}</p>
                      <span className="px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-800 font-medium">
                        {entry.category || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-2 italic">"{entry.prompt}"</p>
                <p className="text-sm text-gray-500">
                  {new Date(entry.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          // Desktop view - table
          <table className="min-w-full divide-y divide-[#8f5a39]/10">
            <thead className="bg-[#8f5a39]/5">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#8f5a39] uppercase tracking-wider">
                  Rank
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#8f5a39] uppercase tracking-wider">
                  Challenger
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#8f5a39] uppercase tracking-wider">
                  Mode
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#8f5a39] uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#8f5a39] uppercase tracking-wider">
                  Winning Prompt
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-[#8f5a39] uppercase tracking-wider">
                  Achievement Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#8f5a39]/10">
              {currentEntries.map((entry, index) => (
                <tr key={entry.timestamp} className="hover:bg-[#8f5a39]/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#8f5a39]/10 text-[#8f5a39] font-bold">
                      {(currentPage - 1) * entriesPerPage + index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{entry.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 rounded-full text-sm bg-[#8f5a39]/10 text-[#8f5a39]">
                      {entry.mode}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-800 font-medium">
                      {entry.category || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-600 max-w-md truncate italic">"{entry.prompt}"</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(entry.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}


      </div>
      
      {/* Pagination */}
      {pageCount > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="inline-flex items-center px-4 py-2 border-2 border-[#8f5a39] text-[#8f5a39] rounded-lg bg-white shadow-sm transition-all hover:bg-[#8f5a39] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#8f5a39]"
          >
            ← Previous
          </button>
          <span className="px-3 py-1 text-[#8f5a39]">
            Page {currentPage} of {pageCount}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))}
            disabled={currentPage === pageCount}
            className="inline-flex items-center px-4 py-2 border-2 border-[#8f5a39] text-[#8f5a39] rounded-lg bg-white shadow-sm transition-all hover:bg-[#8f5a39] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#8f5a39]"
          >
            Next →
          </button>
        </div>
      )}

      {/* Action Buttons - Fixed at bottom */}
      <div className="mt-auto pt-8 pb-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 rounded-lg text-white shadow-lg transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8f5a39]"
              style={{ 
                background: 'linear-gradient(to right, #8f5a39, #b17349)',
                boxShadow: '0 4px 6px -1px rgba(143, 90, 57, 0.2), 0 2px 4px -1px rgba(143, 90, 57, 0.1)'
              }}
            >
              ← Back to Event
            </Link>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-6 py-3 border-2 border-[#8f5a39] text-[#8f5a39] rounded-lg bg-white shadow-lg transition-all transform hover:scale-[1.02] hover:bg-[#8f5a39] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8f5a39]"
            >
              <TrashIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Clear Leaderboard
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default Leaderboard;