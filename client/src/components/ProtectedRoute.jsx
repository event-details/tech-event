import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, LockClosedIcon } from '@heroicons/react/24/outline';

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const ADMIN_PASSWORD = 'Avtrix08@';

  useEffect(() => {
    // Check if user is already authenticated
    const adminMode = localStorage.getItem('adminMode') === 'true';
    const sessionAuth = sessionStorage.getItem('adminAuthenticated') === 'true';
    
    if (adminMode && sessionAuth) {
      setIsAuthenticated(true);
    } else {
      // Clear admin mode if not authenticated
      localStorage.setItem('adminMode', 'false');
      window.dispatchEvent(new Event('adminModeChanged'));
    }
    
    setIsLoading(false);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuthenticated', 'true');
      localStorage.setItem('adminMode', 'true');
      window.dispatchEvent(new Event('adminModeChanged'));
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#8f5a39' }}></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-full flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8" style={{ border: '1px solid #f4efe7' }}>
            <div className="text-center mb-8">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                style={{ backgroundColor: '#f4efe7' }}
              >
                <LockClosedIcon className="w-8 h-8" style={{ color: '#8f5a39' }} />
              </div>
              <h2 
                className="text-2xl font-bold mb-2"
                style={{ color: '#8f5a39' }}
              >
                Admin Access Required
              </h2>
              <p className="text-gray-600">
                Enter the admin password to access this page
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold mb-2" style={{ color: '#8f5a39' }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:scale-[1.02] text-gray-900 bg-white"
                    style={{ 
                      borderColor: error ? '#ef4444' : '#f4efe7',
                      focusBorderColor: error ? '#ef4444' : '#905a39'
                    }}
                    onFocus={(e) => !error && (e.target.style.borderColor = '#905a39')}
                    onBlur={(e) => !error && (e.target.style.borderColor = '#f4efe7')}
                    placeholder="Enter admin password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {error && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                    {error}
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => window.history.back()}
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
                  type="submit"
                  className="flex-1 px-6 py-3 text-sm font-semibold text-white rounded-xl border-2 border-transparent transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: '#8f5a39' }}
                >
                  Access Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;