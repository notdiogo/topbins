import React, { useState } from 'react';
import { ManagePage } from './manage/ManagePage';
import { Bet } from '../types';

const ADMIN_PASSWORD = 'slbenfica';
const SESSION_KEY = 'admin_auth';

interface AdminGateProps {
  bets: Bet[];
  onBetsChange: (bets: Bet[]) => void;
}

export const AdminGate: React.FC<AdminGateProps> = ({ bets, onBetsChange }) => {
  const [authed, setAuthed] = useState(sessionStorage.getItem(SESSION_KEY) === '1');
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      setAuthed(true);
    } else {
      setError(true);
      setInput('');
    }
  };

  if (authed) {
    return <ManagePage bets={bets} onBetsChange={onBetsChange} />;
  }

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center px-4">
      <div className="w-full max-w-xs">
        <div className="text-center mb-8">
          <h1 className="font-serif font-bold text-3xl text-ink tracking-tight">TopBins ⚽</h1>
          <p className="text-muted text-sm mt-1">Admin</p>
        </div>
        <div className="bg-beige border border-warm-border rounded-lg p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={input}
                onChange={(e) => { setInput(e.target.value); setError(false); }}
                autoFocus
                className="w-full bg-parchment border border-warm-border rounded px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-forest/50"
              />
              {error && <p className="text-xs text-red-600 mt-1">Wrong password.</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-forest text-parchment text-sm font-semibold py-2.5 rounded hover:bg-forest/90 transition-colors"
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
