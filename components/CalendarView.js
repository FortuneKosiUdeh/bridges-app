import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function CalendarView({ events, onDateSelect }) {
  const [mode, setMode] = useState('list');
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button className={`px-3 py-1 ${mode==='list' ? 'bg-blue-600 text-white' : 'border'}`} onClick={()=>setMode('list')}>List</button>
        <button className={`px-3 py-1 ${mode==='grid' ? 'bg-blue-600 text-white' : 'border'}`} onClick={()=>setMode('grid')}>Calendar</button>
      </div>

      {mode==='list' ? (
        <div className="space-y-3">
          {events.map(ev => (
            <div key={ev.id} className="p-3 border rounded">{ev.title} — {new Date(ev.date).toLocaleString()}</div>
          ))}
        </div>
      ) : (
        <Calendar
          onClickDay={(date) => {
            const selected = events.filter(ev => new Date(ev.date).toDateString() === date.toDateString());
            onDateSelect(selected);
          }}
        />
      )}
    </div>
  );
}
