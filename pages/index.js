import React, { useEffect, useState } from 'react';
import EventCard from '../components/EventCard';
import CalendarView from '../components/CalendarView';
import MapboxMap from '../components/MapboxMap';

import Tabs from '../components/Tabs';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [originalEvents, setOriginalEvents] = useState([]);
  const [lang, setLang] = useState('en');
  const [category, setCategory] = useState('all');
  const [town, setTown] = useState('all');
  const [filtered, setFiltered] = useState([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bridges_profile') || '{}'); } catch { return {}; }
  });
  const [activeTab, setActiveTab] = useState('list');

  useEffect(() => {
    fetch('/api/events').then(r=>r.json()).then(data => {
      setEvents(data);
      setOriginalEvents(data);
    });
  }, []);

  useEffect(() => {
    if (lang === 'en') {
      setEvents(originalEvents);
      return;
    }

    const translateEvents = async () => {
      const translatedEvents = await Promise.all(originalEvents.map(async (event) => {
        const [title, description] = await Promise.all([
          fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: event.title, target: lang }) }).then(r => r.json()),
          fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: event.description, target: lang }) }).then(r => r.json())
        ]);
        return {
          ...event,
          title: title.translation,
          description: description.translation
        };
      }));
      setEvents(translatedEvents);
    };

    translateEvents();
  }, [lang, originalEvents]);

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

  const handleLangChange = (e) => {
    setLang(e.target.value);
  };

  return (
    <section className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <Tabs
            tabs={[
              { id: 'list', label: 'List' },
              { id: 'calendar', label: 'Calendar' },
              { id: 'map', label: 'Map' },
            ]}
            activeTab={activeTab}
            onTabClick={setActiveTab}
          />

          {activeTab === 'list' && (
            <div>
              <section className="page-section surface-2 mb-4">
                <div className="flex gap-2">
                  <select className="border rounded p-2" value={category} onChange={e=>setCategory(e.target.value)}>
                    <option value="all">All categories</option>
                    <option value="arts">Arts</option>
                    <option value="community">Community</option>
                    <option value="cultural">Cultural</option>
                    <option value="educational">Educational</option>
                    <option value="STEM">STEM</option>
                    <option value="volunteering">Volunteering</option>
                    <option value="workshop">Workshop</option>
                  </select>
                  <select className="border rounded p-2" value={town} onChange={e=>setTown(e.target.value)}>
                    <option value="all">All towns</option>
                    <option value="Lawrence">Lawrence</option>
                    <option value="Andover">Andover</option>
                  </select>
                  <select className="border rounded p-2" value={lang} onChange={handleLangChange}>
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>
              </section>
              <div className="space-y-3">
                {(filtered.length ? filtered : events).map(ev => (
                  <EventCard key={ev.id} event={ev} onCheckIn={handleCheckIn}/>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <CalendarView events={events} onDateSelect={setSelectedDateEvents} />
          )}

          {activeTab === 'map' && (
            <MapboxMap events={filtered.length ? filtered : events} />
          )}
        </div>

        <aside className="space-y-4">
          <div className="page-section surface-2">
            <h3 className="font-semibold">About</h3>
            <p className="text-sm text-gray-700">Bridges connects teens & families across Lawrence and Andover. Toggle language, filter events, check-in to earn badges.</p>
          </div>

          <div className="page-section surface-3">
            <h3 className="font-semibold">Quick Filters</h3>
            <button onClick={()=>{ setCategory('arts'); setTown('Lawrence'); }} className="mt-2 block px-2 py-1 border rounded">Lawrence Arts</button>
            <button onClick={()=>{ setCategory('cultural'); setTown('Lawrence'); }} className="mt-2 block px-2 py-1 border rounded">Lawrence Cultural</button>
            <button onClick={()=>{ setCategory('STEM'); setTown('Andover'); }} className="mt-2 block px-2 py-1 border rounded">Andover STEM</button>
          </div>
        </aside>
      </section>
  );
}
