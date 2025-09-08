import React, { useEffect, useState } from 'react';
import EventCard from '../components/EventCard';
import CalendarView from '../components/CalendarView';
import MapboxMap from '../components/MapboxMap';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [lang, setLang] = useState('en');
  const [category, setCategory] = useState('all');
  const [town, setTown] = useState('all');
  const [filtered, setFiltered] = useState([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bridges_profile') || '{}'); } catch { return {}; }
  });

  useEffect(() => {
    fetch('/api/events').then(r=>r.json()).then(setEvents);
  }, []);

  useEffect(() => {
    let f = events;
    if (category !== 'all') f = f.filter(e => e.category === category);
    if (town !== 'all') f = f.filter(e => e.town === town);
    setFiltered(f);
  }, [events, category, town]);

  const handleCheckIn = (ev) => {
    const p = JSON.parse(localStorage.getItem('bridges_profile') || '{}');
    p.name = p.name || 'Guest';
    p.history = p.history || [];
    p.history.push({ id: ev.id, title: ev.title, date: new Date().toISOString() });
    p.hours = (p.hours || 0) + (ev.category === 'volunteering' ? 1 : 0);
    p.badges = p.badges || [];
    if (ev.category === 'cultural' && !p.badges.includes('Cultural Explorer')) p.badges.push('Cultural Explorer');
    if (ev.category === 'STEM' && !p.badges.includes('STEM Seeker')) p.badges.push('STEM Seeker');
    if ((p.hours || 0) >= 5 && !p.badges.includes('Community Builder')) p.badges.push('Community Builder');

    localStorage.setItem('bridges_profile', JSON.stringify(p));
    setProfile(p);
    alert(`Checked in to: ${ev.title}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bridges — Lawrence & Andover</h1>
        <div className="flex gap-2 items-center">
          <select value={lang} onChange={e=>setLang(e.target.value)} className="border rounded px-2 py-1">
            <option value="en">EN</option>
            <option value="es">ES</option>
          </select>
          <a href="/profile" className="px-3 py-1 border rounded">Profile</a>
        </div>
      </header>

      <section className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="flex gap-2">
            <select className="border rounded p-2" value={category} onChange={e=>setCategory(e.target.value)}>
              <option value="all">All categories</option>
              <option value="cultural">Cultural</option>
              <option value="STEM">STEM</option>
              <option value="volunteering">Volunteering</option>
              <option value="educational">Educational</option>
            </select>
            <select className="border rounded p-2" value={town} onChange={e=>setTown(e.target.value)}>
              <option value="all">All towns</option>
              <option value="Lawrence">Lawrence</option>
              <option value="Andover">Andover</option>
            </select>
          </div>

          <MapboxMap events={filtered.length ? filtered : events} />

          <CalendarView events={events} onDateSelect={setSelectedDateEvents} />

          <div className="space-y-3">
            {(selectedDateEvents.length ? selectedDateEvents : (filtered.length ? filtered : events)).map(ev => (
              <EventCard key={ev.id} event={ev} lang={lang} onCheckIn={handleCheckIn}/>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="p-3 border rounded">
            <h3 className="font-semibold">About</h3>
            <p className="text-sm text-gray-700">Bridges connects teens & families across Lawrence and Andover. Toggle language, filter events, check-in to earn badges.</p>
          </div>

          <div className="p-3 border rounded">
            <h3 className="font-semibold">Quick Filters</h3>
            <button onClick={()=>{ setCategory('cultural'); setTown('Lawrence'); }} className="mt-2 block px-2 py-1 border rounded">Lawrence Cultural</button>
            <button onClick={()=>{ setCategory('STEM'); setTown('Andover'); }} className="mt-2 block px-2 py-1 border rounded">Andover STEM</button>
          </div>

          <div className="p-3 border rounded">
            <h3 className="font-semibold">Sample Demo Account</h3>
            <p className="text-sm">Use guest mode — check-ins are saved locally in your browser (no backend required).</p>
          </div>
        </aside>
      </section>
    </div>
  );
}
