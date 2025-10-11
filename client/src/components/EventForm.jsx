import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import RestoreHistoryModal from './RestoreHistoryModal';

function EventForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    date: '',
    venue: '',
    rows: '',
    feedbackLink: ''
  });
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  useEffect(() => {
    // Load initial data from localStorage or data.json
    const loadInitialData = async () => {
      const storedData = localStorage.getItem('eventData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        if (data) {
        setFormData({
          ...data,
          rows: JSON.stringify(data.rows, null, 2),
          feedbackLink: data.feedbackLink || ''
        });
      }
      } else {
        try {
          const response = await fetch('/api/event-data');
          const data = await response.json();
          setFormData({
            ...data.eventData,
            rows: JSON.stringify(data.eventData.rows, null, 2)
          });
        } catch (error) {
          console.error('Error fetching event data:', error);
        }
      }
    };

    loadInitialData();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      // Validate JSON
      const rows = JSON.parse(formData.rows);
      if (!Array.isArray(rows)) {
        throw new Error('Rows must be an array');
      }

      const newEventData = {
        ...formData,
        rows
      };

      // Save to history
      const history = JSON.parse(localStorage.getItem('eventDataHistory') || '[]');
      history.push({
        ...newEventData,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('eventDataHistory', JSON.stringify(history));

      // Save current version
      localStorage.setItem('eventData', JSON.stringify(newEventData));
      
      toast.success('Event data saved successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Invalid JSON in rows field');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Event Data</h1>
        <button
          onClick={() => setShowRestoreModal(true)}
          style={{ color: '#8f5a39' }}
          className="hover:opacity-90"
        >
          Restore Previous Version
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700">
            Subtitle
          </label>
          <input
            type="text"
            id="subtitle"
            required
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="text"
            id="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="venue" className="block text-sm font-medium text-gray-700">
            Venue
          </label>
          <input
            type="text"
            id="venue"
            required
            value={formData.venue}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="feedbackLink" className="block text-sm font-medium text-gray-700">
            Feedback Link
          </label>
          <input
            type="url"
            id="feedbackLink"
            placeholder="https://example.com/feedback"
            value={formData.feedbackLink}
            onChange={(e) => setFormData({ ...formData, feedbackLink: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="rows" className="block text-sm font-medium text-gray-700">
            Rows (JSON Array)
          </label>
          <textarea
            id="rows"
            required
            rows={10}
            value={formData.rows}
            onChange={(e) => setFormData({ ...formData, rows: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
          >
            Save Changes
          </button>
        </div>
      </form>

      <RestoreHistoryModal
        isOpen={showRestoreModal}
        onClose={() => setShowRestoreModal(false)}
        onRestore={(data) => {
          setFormData({
            ...data,
            rows: JSON.stringify(data.rows, null, 2)
          });
          setShowRestoreModal(false);
          toast.success('Previous version restored');
        }}
      />
    </div>
  );
}

export default EventForm;