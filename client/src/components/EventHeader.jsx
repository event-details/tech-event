function EventHeader({ eventData }) {
  const { title, subtitle, date, venue } = eventData;

  return (
    <div className="text-center mb-16">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4" style={{ color: '#8f5a39' }}>
        {title}
      </h1>
      <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto font-medium">
        {subtitle}
      </p>
      
      {/* Date and Venue Container */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6">
        {/* Date */}
        <div 
          className="flex items-center px-4 py-2 rounded-xl border shadow-sm bg-white"
          style={{ borderColor: '#f4efe7' }}
        >
          <CalendarIcon className="h-5 w-5 mr-3" style={{ color: '#8f5a39' }} />
          <span className="text-gray-900 font-medium">{date}</span>
        </div>
        
        {/* Separator */}
        <div className="hidden sm:block w-2 h-2 rounded-full bg-gray-300"></div>
        
        {/* Venue */}
        <div 
          className="flex items-center px-4 py-2 rounded-xl border shadow-sm bg-white"
          style={{ borderColor: '#f4efe7' }}
        >
          <MapPinIcon className="h-5 w-5 mr-3" style={{ color: '#8f5a39' }} />
          <span className="text-gray-900 font-medium">{venue}</span>
        </div>
      </div>
    </div>
  );
}

import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
export default EventHeader;