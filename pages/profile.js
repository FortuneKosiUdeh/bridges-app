import React, { useEffect, useState } from 'react';

export default function Profile() {
  const [profile, setProfile] = useState({});

  useEffect(()=> {
    try {
      const p = JSON.parse(localStorage.getItem('bridges_profile') || '{}');
      setProfile(p);
    } catch {
      setProfile({});
    }
  }, []);

  const clear = () => { localStorage.removeItem('bridges_profile'); setProfile({}); };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="border p-4 rounded">
        <p><strong>Name:</strong> {profile.name || 'Guest'}</p>
        <p><strong>School / Grade:</strong> {profile.school || '-'}</p>
        <p><strong>Service hours:</strong> {profile.hours || 0}</p>
        <p><strong>Badges:</strong> {profile.badges ? profile.badges.join(', ') : '—'}</p>
        <p className="mt-2"><strong>Event history:</strong></p>
        <ul className="list-disc ml-6">
          {profile.history?.map(h => <li key={h.id}>{h.title} — {new Date(h.date).toLocaleString()}</li>)}
        </ul>
      </div>

      <div className="mt-4 flex gap-2">
        <button className="px-3 py-1 border rounded" onClick={()=>{
          const p = { ...profile, name: 'Demo Student', school: 'Local HS', grade: '10' };
          localStorage.setItem('bridges_profile', JSON.stringify(p)); setProfile(p);
        }}>Fill demo profile</button>
        <button className="px-3 py-1 border rounded" onClick={()=>{
          const p = { ...profile, hours: (profile.hours || 0) + 1 };
          localStorage.setItem('bridges_profile', JSON.stringify(p)); setProfile(p);
        }}>+1 Service hour</button>
        <button className="px-3 py-1 border rounded text-red-600" onClick={clear}>Reset</button>
      </div>

      <div className="mt-6">
        <a href="/" className="text-sm text-blue-600">← Back</a>
      </div>
    </div>
  );
}
