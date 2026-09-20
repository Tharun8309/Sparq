import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="font-serif text-6xl font-extrabold text-sparq-maroon mb-2">404</h1>
      <h2 className="font-bold text-lg text-sparq-darkmaroon mb-2">Celebration Page Not Found</h2>
      <p className="text-xs text-gray-600 mb-6 max-w-sm">
        The fireworks page or category you are searching for does not exist or has been relocated.
      </p>
      <Link
        to="/"
        className="bg-sparq-maroon text-sparq-cream text-xs font-bold px-6 py-2.5 rounded hover:bg-sparq-darkmaroon border border-sparq-gold/30"
      >
        Return to Home
      </Link>
    </div>
  );
}
