import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Home } from 'lucide-react';

interface NavbarProps {
  lastUpdated: string;
}

const SEASONS = [
  { slug: 'epl-25-26', label: 'Season 25/26' },
  { slug: 'epl-26-27', label: 'Season 26/27' },
];

export const Navbar: React.FC<NavbarProps> = ({ lastUpdated }) => {
  const isHome = useLocation().pathname === '/';

  const link = (active: boolean) =>
    `text-sm font-medium ${active ? 'text-ink' : 'text-muted hover:text-ink'}`;

  return (
    <header className="bg-parchment/85 backdrop-blur-md border-b border-warm-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-start">
        <nav className="flex items-center gap-4 sm:gap-6">
          {!isHome && (
            <NavLink to="/" className="text-muted hover:text-ink">
              <Home className="w-5 h-5" />
            </NavLink>
          )}
          <div className="relative group py-2">
            <button
              className={`flex items-center gap-1 text-sm font-medium text-muted group-hover:text-ink`}
            >
              Seasons <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <div className="absolute left-0 top-full pt-1 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="bg-stone border border-warm-border rounded-xl shadow-lg overflow-hidden">
                {SEASONS.map((s) => (
                  <NavLink
                    key={s.slug}
                    to={`/g/${s.slug}`}
                    className={({ isActive }) => `block px-4 py-3 text-sm ${isActive ? 'text-ink font-semibold bg-beige' : 'text-muted hover:text-ink hover:bg-beige'}`}
                  >
                    {s.label}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>

          <NavLink to="/stats" className={({ isActive }) => link(isActive)}>All Stats</NavLink>
        </nav>
      </div>
    </header>
  );
};
