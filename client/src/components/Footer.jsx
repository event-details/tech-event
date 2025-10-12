import { useState, useEffect } from 'react';
import ConsentModal from './ConsentModal';

function Footer() {
  const currentYear = new Date().getFullYear();
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [eventData, setEventData] = useState(null);

  // Load event data to get dynamic email
  useEffect(() => {
    const loadEventData = async () => {
      const storedData = localStorage.getItem('eventData');
      if (storedData) {
        setEventData(JSON.parse(storedData));
      } else {
        try {
          const response = await fetch('/api/event-data');
          const data = await response.json();
          setEventData(data.eventData);
        } catch (error) {
          console.error('Error fetching event data:', error);
        }
      }
    };

    loadEventData();
  }, []);

  const handleConsentAgree = () => {
    // You can add logic here to store consent in localStorage if needed
    console.log('User agreed to privacy notice');
  };

  const contactEmail = eventData?.email || 'hello@techevent.com';

  return (
    <footer className="bg-white border-t" style={{ borderColor: '#f4efe7' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Clean, Minimal Footer - Centered */}
        <div className="flex flex-col items-center justify-center space-y-3">
          {/* Copyright */}
          <div className="flex items-center">
            <p className="text-gray-600 text-sm">
              © 2025 Tech Event. All rights reserved.
            </p>
          </div>

          {/* Privacy Notice */}
          <div className="flex items-center">
            <button 
              onClick={() => setShowConsentModal(true)}
              className="text-gray-600 hover:opacity-80 transition-all duration-200 hover:scale-105 text-sm underline underline-offset-2"
            >
              Privacy Notice
            </button>
          </div>
        </div>
      </div>

      {/* Consent Modal */}
      <ConsentModal
        isOpen={showConsentModal}
        onClose={() => setShowConsentModal(false)}
        onAgree={handleConsentAgree}
      />
    </footer>
  );
}

export default Footer;