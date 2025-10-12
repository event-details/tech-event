import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

function AdminLogout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear admin authentication
    sessionStorage.removeItem('adminAuthenticated');
    localStorage.setItem('adminMode', 'false');
    
    // Notify header to update
    window.dispatchEvent(new Event('adminModeChanged'));
    
    // Navigate to home
    navigate('/');
  };

  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105"
      style={{ 
        color: '#8f5a39',
        backgroundColor: '#f4efe7',
        border: '1px solid #905a39'
      }}
      title="Exit Admin Mode"
    >
      <ArrowRightOnRectangleIcon className="w-4 h-4" />
      Exit Admin
    </button>
  );
}

export default AdminLogout;