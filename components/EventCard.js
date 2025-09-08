import React from 'react';

export default function EventCard({ event, lang='en', onCheckIn }) {
  const desc = event.description?.[lang] ?? event.description?.en ?? '';
  const date = new Date(event.date).toLocaleString();
  return (
    <div className="border rounded-lg p-4 shadow-sm bg-white">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold">{event.title}</h3>
        <span className="text-xs px-2 py-1 bg-gray-100 rounded">{event.category}</span>
      </div>
      <p className="text-sm text-gray-700 mt-2">{desc}</p>
      <p className="text-xs text-gray-500 mt-2">{date}</p>
      <p className="text-xs text-gray-500">{event.location.name} • {event.location.address}</p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onCheckIn && onCheckIn(event)}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded"
        >Check-in</button>
        <a href={event.bilingualFlyerURL} target="_blank" rel="noreferrer"
           className="px-3 py-1 text-sm border rounded">Flyer</a>
      </div>
    </div>
  );
}
