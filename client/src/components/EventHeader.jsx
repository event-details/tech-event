function EventHeader({ eventData }) {
  const { title, subtitle, date, venue } = eventData;

  return (
    <div className="text-center mb-12 font-serif">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-xl text-gray-600 mb-6">{subtitle}</p>
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        <div className="flex items-center">
          <CalendarIcon className="h-5 w-5 text-indigo-600 mr-2" />
          <span className="text-gray-700">{date}</span>
        </div>
        <div className="hidden sm:block text-gray-400 mx-2">•</div>
        <div className="flex items-center">
          <MapPinIcon className="h-5 w-5 text-indigo-600 mr-2" />
          <span className="text-gray-700">{venue}</span>
        </div>
      </div>
    </div>
  );
}

import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
export default EventHeader;