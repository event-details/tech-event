import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
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

        <div className="fixed bottom-20 right-4 z-40">
          <a
            href="https://www.google.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ backgroundColor: '#8f5a39' }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-lg text-white hover:opacity-90 transition-colors"
            aria-label="Give feedback"
          >
            Feedback
          </a>
        </div>

        <Chatbot />
      </div>
    </div>
  );
}

export default EventPage;