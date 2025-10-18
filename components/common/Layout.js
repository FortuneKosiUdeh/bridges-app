
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Layout({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    setUser(currentUser);
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <section className="page-section surface-1 mb-6">
        <header className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Bridges — Lawrence & Andover</h1>
          <div className="flex gap-2 items-center">
            <select className="border rounded px-2 py-1">
              <option value="en">EN</option>
              <option value="es">ES</option>
            </select>
            {user ? (
              <Link href="/profile" className="px-3 py-1 border rounded">Profile</Link>
            ) : (
              <Link href="/login" className="px-3 py-1 border rounded">Log In</Link>
            )}
          </div>
        </header>
      </section>
      {children}
    </div>
  );
}
