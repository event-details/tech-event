import { useState, useEffect } from 'react';
import { UserCircleIcon } from '@heroicons/react/24/outline';

function Speakers() {
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load speakers data from localStorage or API
    const loadSpeakers = async () => {
      try {
        const storedData = localStorage.getItem('eventData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setSpeakers(parsedData.speakers || []);
        } else {
          const response = await fetch('/api/event-data');
          const data = await response.json();
          setSpeakers(data.eventData.speakers || []);
        }
      } catch (error) {
        console.error('Error fetching speakers data:', error);
        setSpeakers([]);
      } finally {
        setLoading(false);
      }
    };

    loadSpeakers();
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#8f5a39' }}></div>
            <p className="mt-4 text-gray-600">Loading speakers...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!speakers.length) {
    return (
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <UserCircleIcon className="h-24 w-24 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Speakers Added</h2>
            <p className="text-gray-600">Speaker information will appear here once added to the event.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4" style={{ color: '#8f5a39' }}>
            Our Speakers
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            Meet the industry experts and thought leaders who will be sharing their insights at our event.
          </p>
        </div>

        {/* Speakers Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {speakers.map((speaker, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-xl overflow-hidden border"
              style={{ borderColor: '#f4efe7' }}
            >
              {/* Speaker Avatar */}
              <div 
                className="h-32 flex items-center justify-center"
                style={{ backgroundColor: '#f4efe7' }}
              >
                <UserCircleIcon className="h-20 w-20" style={{ color: '#8f5a39' }} />
              </div>

              {/* Speaker Info */}
              <div className="p-6">
                {Object.entries(speaker).map(([key, value]) => {
                  if (!value) return null;
                  
                  const isFirstEntry = Object.keys(speaker)[0] === key;
                  
                  return (
                    <div key={key} className={isFirstEntry ? 'mb-4' : 'mb-3'}>
                      <dt className={`font-semibold tracking-wider ${isFirstEntry ? 'text-xl mb-2' : 'text-sm mb-1'}`}
                          style={{ color: '#8f5a39' }}>
                        {key}
                      </dt>
                      <dd className={`text-gray-900 ${isFirstEntry ? 'text-base' : 'text-sm'} break-words`}>
                        {value}
                      </dd>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Speakers;