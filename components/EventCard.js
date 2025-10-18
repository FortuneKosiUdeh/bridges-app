import React from 'react';

export default function EventCard({ event, onCheckIn }) {
  const date = new Date(event.date).toLocaleString();
  return (
    <div className="card p-4">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold">{event.title}</h3>
        <span className="text-xs px-2 py-1 bg-gray-100 rounded">{event.category}</span>
      </div>
      <p className="text-sm text-gray-700 mt-2">{event.description}</p>
      <p className="text-xs text-gray-500 mt-2">{date}</p>
      <p className="text-xs text-gray-500">{event.location.name} • {event.location.address}</p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onCheckIn && onCheckIn(event)}
          className="btn-primary"
        >Check-in</button>
        {(() => {
          const flyer = (event.bilingualFlyerURL && (event.bilingualFlyerURL.startsWith('/flyers/') || event.bilingualFlyerURL.toLowerCase().endsWith('.pdf'))) ? event.bilingualFlyerURL : event.sourceURL;
          return (
            <a href={flyer} target="_blank" rel="noopener noreferrer" className="btn-ghost">Flyer</a>
          );
        })()}
      </div>
    </div>
  );
}
