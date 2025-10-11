import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import AdminLogout from './AdminLogout';

function EventForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    date: '',
    venue: '',
    email: '',
    rows: '',
    feedbackLink: '',
    speakers: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load initial data from localStorage or API
    const loadInitialData = async () => {
      try {
        const storedData = localStorage.getItem('eventData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setFormData({
            ...parsedData,
            rows: JSON.stringify(parsedData.rows, null, 2),
            feedbackLink: parsedData.feedbackLink || '',
            email: parsedData.email || '',
            speakers: JSON.stringify(parsedData.speakers || [], null, 2)
          });
        } else {
          const response = await fetch('/api/event-data');
          const data = await response.json();
          setFormData({
            ...data.eventData,
            rows: JSON.stringify(data.eventData.rows, null, 2),
            feedbackLink: data.eventData.feedbackLink || '',
            email: data.eventData.email || '',
            speakers: JSON.stringify(data.eventData.speakers || [], null, 2)
          });
        }
      } catch (error) {
        console.error('Error fetching event data:', error);
        toast.error('Failed to load event data');
      }
    };

    loadInitialData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate JSON
      const rows = JSON.parse(formData.rows);
      if (!Array.isArray(rows)) {
        throw new Error('Rows must be an array');
      }

      const speakers = JSON.parse(formData.speakers);
      if (!Array.isArray(speakers)) {
        throw new Error('Speakers must be an array');
      }

      const eventData = {
        title: formData.title,
        subtitle: formData.subtitle,
        date: formData.date,
        venue: formData.venue,
        email: formData.email,
        feedbackLink: formData.feedbackLink,
        rows,
        speakers
      };

      // Save to server
      const response = await fetch('/api/event-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error('Failed to save event data');
      }

      // Save to localStorage for offline access
      localStorage.setItem('eventData', JSON.stringify(eventData));

      toast.success('Event data saved successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error saving event data:', error);
      if (error.message === 'Rows must be an array') {
        toast.error('Invalid JSON in rows field');
      } else if (error.message === 'Speakers must be an array') {
        toast.error('Invalid JSON in speakers field');
      } else {
        toast.error('Failed to save event data');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-full">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1"></div>
          <div className="text-center">
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{ color: '#8f5a39' }}
            >
              Edit Event Configuration
            </h1>
            <p className="text-gray-600 mt-1">Configure your event details and schedule</p>
          </div>
          <div className="flex-1 flex justify-end">
            <AdminLogout />
          </div>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto">
          <div
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
            style={{ border: '1px solid #f4efe7' }}
          >
            <div
              className="px-8 py-6 border-b"
              style={{
                backgroundColor: '#f4efe7',
                borderColor: '#905a39'
              }}
            >
              <h2
                className="text-xl font-semibold"
                style={{ color: '#8f5a39' }}
              >
                Event Information
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Update your event details and agenda
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Title */}
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-semibold mb-2" style={{ color: '#8f5a39' }}>
                    Event Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:scale-[1.02] text-gray-900 bg-white"
                    style={{
                      borderColor: '#f4efe7',
                      focusBorderColor: '#905a39'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#905a39'}
                    onBlur={(e) => e.target.style.borderColor = '#f4efe7'}
                    placeholder="Enter event title"
                  />
                </div>

                {/* Subtitle */}
                <div className="md:col-span-2">
                  <label htmlFor="subtitle" className="block text-sm font-semibold mb-2" style={{ color: '#8f5a39' }}>
                    Event Subtitle *
                  </label>
                  <input
                    type="text"
                    id="subtitle"
                    required
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:scale-[1.02] text-gray-900 bg-white"
                    style={{
                      borderColor: '#f4efe7',
                      focusBorderColor: '#905a39'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#905a39'}
                    onBlur={(e) => e.target.style.borderColor = '#f4efe7'}
                    placeholder="Enter event subtitle"
                  />
                </div>

                {/* Date */}
                <div>
                  <label htmlFor="date" className="block text-sm font-semibold mb-2" style={{ color: '#8f5a39' }}>
                    Event Date *
                  </label>
                  <input
                    type="text"
                    id="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:scale-[1.02] text-gray-900 bg-white"
                    style={{
                      borderColor: '#f4efe7',
                      focusBorderColor: '#905a39'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#905a39'}
                    onBlur={(e) => e.target.style.borderColor = '#f4efe7'}
                    placeholder="e.g., October 15, 2025"
                  />
                </div>

                {/* Venue */}
                <div>
                  <label htmlFor="venue" className="block text-sm font-semibold mb-2" style={{ color: '#8f5a39' }}>
                    Event Venue *
                  </label>
                  <input
                    type="text"
                    id="venue"
                    required
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:scale-[1.02] text-gray-900 bg-white"
                    style={{
                      borderColor: '#f4efe7',
                      focusBorderColor: '#905a39'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#905a39'}
                    onBlur={(e) => e.target.style.borderColor = '#f4efe7'}
                    placeholder="Enter venue location"
                  />
                </div>

                {/* Contact Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: '#8f5a39' }}>
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:scale-[1.02] text-gray-900 bg-white"
                    style={{ 
                      borderColor: '#f4efe7',
                      focusBorderColor: '#905a39'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#905a39'}
                    onBlur={(e) => e.target.style.borderColor = '#f4efe7'}
                    placeholder="contact@techevent.com"
                  />
                </div>

                {/* Feedback Link */}
                <div className="md:col-span-2">
                  <label htmlFor="feedbackLink" className="block text-sm font-semibold mb-2" style={{ color: '#8f5a39' }}>
                    Feedback Link
                  </label>
                  <input
                    type="url"
                    id="feedbackLink"
                    value={formData.feedbackLink}
                    onChange={(e) => setFormData({ ...formData, feedbackLink: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:scale-[1.02] text-gray-900 bg-white"
                    style={{
                      borderColor: '#f4efe7',
                      focusBorderColor: '#905a39'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#905a39'}
                    onBlur={(e) => e.target.style.borderColor = '#f4efe7'}
                    placeholder="https://example.com/feedback"
                  />
                </div>
              </div>

              {/* Agenda JSON */}
              <div className="mb-8">
                <label htmlFor="rows" className="block text-sm font-semibold mb-2" style={{ color: '#8f5a39' }}>
                  Event Agenda (JSON Format) *
                </label>
                <div className="relative">
                  <textarea
                    id="rows"
                    required
                    rows={12}
                    value={formData.rows}
                    onChange={(e) => setFormData({ ...formData, rows: e.target.value })}
                    className="w-full px-4 py-4 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:scale-[1.01] text-gray-900 bg-white font-mono text-sm"
                    style={{
                      borderColor: '#f4efe7',
                      focusBorderColor: '#905a39'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#905a39'}
                    onBlur={(e) => e.target.style.borderColor = '#f4efe7'}
                    placeholder="Enter event agenda as JSON array..."
                  />
                  <div className="absolute top-2 right-2 text-xs text-gray-400 bg-white px-2 py-1 rounded">
                    JSON
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Enter the event schedule as a JSON array. Each item should have Start, End, Category, Topic, and Speakers fields.
                </p>
              </div>

              {/* Speakers JSON */}
              <div className="mb-8">
                <label htmlFor="speakers" className="block text-sm font-semibold mb-2" style={{ color: '#8f5a39' }}>
                  Speaker Information (JSON Format)
                </label>
                <div className="relative">
                  <textarea
                    id="speakers"
                    rows={10}
                    value={formData.speakers}
                    onChange={(e) => setFormData({ ...formData, speakers: e.target.value })}
                    className="w-full px-4 py-4 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:scale-[1.01] text-gray-900 bg-white font-mono text-sm"
                    style={{
                      borderColor: '#f4efe7',
                      focusBorderColor: '#905a39'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#905a39'}
                    onBlur={(e) => e.target.style.borderColor = '#f4efe7'}
                    placeholder='[{"Speaker": "John Doe", "Title": "CEO", "Company": "Tech Corp", "Bio": "Experienced leader in technology"}]'
                  />
                  <div className="absolute top-2 right-2 text-xs text-gray-400 bg-white px-2 py-1 rounded">
                    JSON
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Enter speaker information as a JSON array. Each speaker object can have any key-value pairs (e.g., Speaker, Title, Company, Bio, etc.).
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">

                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="px-6 py-3 text-sm font-medium rounded-xl border-2 transition-all duration-200 hover:scale-105"
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
                  disabled={loading}
                  className="px-8 py-3 text-sm font-semibold text-white rounded-xl border-2 border-transparent transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  style={{ backgroundColor: '#8f5a39' }}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventForm;