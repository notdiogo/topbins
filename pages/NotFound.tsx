import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24 text-center">
      <h1 className="font-display text-6xl font-bold text-ink">404</h1>
      <p className="text-muted mt-3">That page doesn't exist.</p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 mt-6 bg-forest text-stone text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-forest-mid transition-colors"
      >
        Back home
      </Link>
    </div>
  );
};
