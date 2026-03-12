import React from 'react';

interface NavbarProps {
  lastUpdated: string;
  onNavigate: (id: string) => void;
  isAdmin: boolean;
  onManage: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ lastUpdated, onNavigate, isAdmin, onManage, onSignOut }) => {
  return (
    <header className="sticky top-0 z-50 bg-parchment/95 backdrop-blur-sm border-b border-warm-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => onNavigate('home')}
          className="font-serif font-bold text-xl text-ink tracking-tight hover:text-forest transition-colors"
        >
          TopBins ⚽
        </button>

        {/* Nav links */}
        <nav className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={() => onNavigate('dashboard')}
            className="text-sm font-medium text-muted hover:text-ink transition-colors"
          >
            Bets
          </button>
          <button
            onClick={() => onNavigate('standings')}
            className="text-sm font-medium text-muted hover:text-ink transition-colors"
          >
            Standings
          </button>

          {isAdmin && (
            <button
              onClick={onManage}
              className="text-sm font-medium text-forest hover:text-forest/70 transition-colors"
            >
              Manage
            </button>
          )}

          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted bg-beige px-2.5 py-1 rounded-full border border-warm-border">
            <span className="w-1.5 h-1.5 rounded-full bg-forest animate-pulse inline-block" />
            {lastUpdated}
          </span>

          <button
            onClick={onSignOut}
            className="text-xs text-muted hover:text-ink transition-colors border border-warm-border rounded px-2.5 py-1"
          >
            Sign out
          </button>
        </nav>
      </div>
    </header>
  );
};
