import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function LogIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find((user) => user.email === email && user.password === password);

    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      router.push('/profile');
    } else {
      setError('Invalid email or password.');
    }
  };

  return (
    <section className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <div className="page-section surface-2">
          <h1 className="text-2xl font-bold">Log In</h1>
          <p className="text-sm text-gray-700">Log in to your account.</p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && <p className="text-red-500">{error}</p>}
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>
            <div>
              <button type="submit" className="btn-primary w-full">
                Log In
              </button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/signup" legacyBehavior>
                <a className="font-medium text-primary hover:text-primary-600">
                  Sign up
                </a>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}