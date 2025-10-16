import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, CogIcon } from '@heroicons/react/24/outline';
import AdminPasswordModal from './AdminPasswordModal';
import ConsentModal from './ConsentModal';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const location = useLocation();

  const handleConsentAgree = () => {
    // You can add logic here to store consent in localStorage if needed
    console.log('User agreed to privacy notice');
  };

  // Check for admin mode on component mount and localStorage changes
  useEffect(() => {
    const checkAdminMode = () => {
      const adminMode = localStorage.getItem('adminMode') === 'true';
      setIsAdminMode(adminMode);
    };
    
    checkAdminMode();
    
    // Listen for localStorage changes
    const handleStorageChange = () => {
      checkAdminMode();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('adminModeChanged', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('adminModeChanged', handleStorageChange);
    };
  }, []);

  const publicNavigation = [
    { name: 'Home', href: '/' },
    { name: 'Speakers', href: '/speakers' },
    { name: 'Leaderboard', href: '/leaderboard' }
  ];

  const adminNavigation = [
    { name: 'Edit Event', href: '/form' },
    { name: 'Setup Chatbot', href: '/chatanswers' }
  ];

  // Navigation logic: public routes + admin routes (desktop only) + consent form
  const getDesktopNavigation = () => {
    const nav = [...publicNavigation];
    if (isAdminMode) {
      nav.push(...adminNavigation);
    }
    nav.push({ name: 'Privacy', href: '#', action: () => setShowConsentModal(true) });
    return nav;
  };

  const getMobileNavigation = () => {
    // Mobile: only public navigation + privacy
    return [
      ...publicNavigation,
      { name: 'Privacy', href: '#', action: () => setShowConsentModal(true) }
    ];
  };

  const toggleAdminMode = () => {
    if (isAdminMode) {
      // If already in admin mode, disable it immediately
      localStorage.setItem('adminMode', 'false');
      sessionStorage.removeItem('adminAuthenticated');
      setIsAdminMode(false);
      window.dispatchEvent(new Event('adminModeChanged'));
    } else {
      // If not in admin mode, show password modal
      setShowPasswordModal(true);
    }
  };

  const handleAdminSuccess = () => {
    localStorage.setItem('adminMode', 'true');
    sessionStorage.setItem('adminAuthenticated', 'true');
    setIsAdminMode(true);
    window.dispatchEvent(new Event('adminModeChanged'));
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40" style={{ borderColor: '#f4efe7' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand/Logo */}
          <div className="flex-shrink-0">
            <Link 
              to="/" 
              className="text-xl font-bold tracking-tight transition-all duration-200 hover:scale-105"
              style={{ color: '#8f5a39' }}
              onClick={closeMenu}
            >
              Bengaluru Tech Center
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <nav className="flex items-center space-x-1">
              {getDesktopNavigation().map((item) => (
                item.action ? (
                  <button
                    key={item.name}
                    onClick={item.action}
                    className="px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 rounded-xl"
                    style={{ 
                      color: '#6b7280',
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f4efe7';
                      e.target.style.color = '#8f5a39';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#6b7280';
                    }}
                  >
                    {item.name}
                  </button>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 rounded-xl ${
                      location.pathname === item.href ? 'shadow-sm' : ''
                    }`}
                    style={{ 
                      color: location.pathname === item.href ? '#8f5a39' : '#6b7280',
                      backgroundColor: location.pathname === item.href ? '#f4efe7' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (location.pathname !== item.href) {
                        e.target.style.backgroundColor = '#f4efe7';
                        e.target.style.color = '#8f5a39';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (location.pathname !== item.href) {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#6b7280';
                      }
                    }}
                  >
                    {item.name}
                  </Link>
                )
              ))}
            </nav>
            
            {/* Admin Mode Toggle - Desktop Only */}
            <div className="ml-4 pl-4 border-l" style={{ borderColor: '#f4efe7' }}>
              <button
                onClick={toggleAdminMode}
                className={`p-2 rounded-xl transition-all duration-200 hover:scale-105 ${
                  isAdminMode ? 'shadow-sm' : ''
                }`}
                style={{ 
                  color: isAdminMode ? '#8f5a39' : '#9ca3af',
                  backgroundColor: isAdminMode ? '#f4efe7' : 'transparent'
                }}
                title={isAdminMode ? 'Exit Admin Mode' : 'Enter Admin Mode'}
                onMouseEnter={(e) => {
                  if (!isAdminMode) {
                    e.target.style.backgroundColor = '#f4efe7';
                    e.target.style.color = '#8f5a39';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isAdminMode) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#9ca3af';
                  }
                }}
              >
                <CogIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-xl transition-all duration-200 hover:scale-105"
            style={{ 
              color: '#8f5a39',
              backgroundColor: isMenuOpen ? '#f4efe7' : 'transparent'
            }}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <XMarkIcon className="w-5 h-5" />
            ) : (
              <Bars3Icon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t bg-gradient-to-b from-white to-gray-50" style={{ borderColor: '#f4efe7' }}>
            <nav className="flex flex-col space-y-1">
              {getMobileNavigation().map((item) => (
                item.action ? (
                  <button
                    key={item.name}
                    onClick={() => {
                      item.action();
                      closeMenu();
                    }}
                    className="text-base font-medium py-3 px-4 rounded-xl transition-all duration-200 hover:scale-[1.02] text-left"
                    style={{ 
                      color: '#6b7280',
                      backgroundColor: 'transparent'
                    }}
                    onTouchStart={(e) => {
                      e.target.style.backgroundColor = '#f4efe7';
                      e.target.style.color = '#8f5a39';
                    }}
                    onTouchEnd={(e) => {
                      setTimeout(() => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#6b7280';
                      }, 150);
                    }}
                  >
                    {item.name}
                  </button>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={closeMenu}
                    className={`text-base font-medium py-3 px-4 rounded-xl transition-all duration-200 hover:scale-[1.02] ${
                      location.pathname === item.href ? 'shadow-sm' : ''
                    }`}
                    style={{ 
                      color: location.pathname === item.href ? '#8f5a39' : '#6b7280',
                      backgroundColor: location.pathname === item.href ? '#f4efe7' : 'transparent'
                    }}
                  >
                    {item.name}
                  </Link>
                )
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Admin Password Modal */}
      <AdminPasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={handleAdminSuccess}
      />

      {/* Consent Modal */}
      <ConsentModal
        isOpen={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        onAgree={handleConsentAgree}
      />
    </header>
  );
}

export default Header;