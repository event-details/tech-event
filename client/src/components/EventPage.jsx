import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import EventHeader from './EventHeader';
import AgendaTable from './AgendaTable';
import AgendaCard from './AgendaCard';
import Chatbot from './Chatbot';

function EventPage() {
  const [eventData, setEventData] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    // Load event data from localStorage or fallback to data.json
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

    // Handle window resize for responsive layout
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!eventData) return <div>Loading...</div>;

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-full">
      <div className="container mx-auto px-4 py-8">
        {/* <div className="flex justify-end mb-4">
          <Link
            to="/form"
            style={{ backgroundColor: '#8f5a39' }}
            className="text-white px-4 py-2 rounded-md hover:opacity-90 transition-colors shadow-sm"
          >
            Edit Event
          </Link>
        </div> */}
        
        <div className="mb-12">
          <EventHeader eventData={eventData} />
        </div>
        
        <div className="mb-8">
          {isMobile ? (
            <AgendaCard rows={eventData.rows} />
          ) : (
            <AgendaTable rows={eventData.rows} />
          )}
        </div>

        <div className="fixed top-1/2 right-4 transform -translate-y-1/2 z-40">
          <a
            href={eventData.feedbackLink || "https://www.google.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-col items-center justify-center px-2 py-6 text-xs font-light tracking-wide rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 relative"
            style={{ 
              backgroundColor: '#f4efe7',
              color: '#905a39',
              border: '1px solid #905a39',
              minHeight: '120px',
              width: '32px'
            }}
            aria-label="Give feedback"
          >
            
            <div
              style={{ 
                writingMode: 'vertical-lr', 
                textOrientation: 'mixed'
            
              }}
            >
              Feedback
            </div>
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
              <ArrowTopRightOnSquareIcon className="w-3 h-3" style={{ color: '#905a39' }} />
            </div>
          </a>
        </div>

        <Chatbot />
      </div>
    </div>
  );
}

export default EventPage;