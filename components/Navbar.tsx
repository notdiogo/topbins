import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

interface NavbarProps {
  lastUpdated: string;
  /** True on the home route, where the bar floats transparently over the hero. */
  overHero?: boolean;
}

const SEASONS = [
  { slug: 'epl-25-26', label: 'Season 25/26' },
  { slug: 'epl-26-27', label: 'Season 26/27' },
];

// Floating top bar. Over the hero it is transparent with light text; once the
// page scrolls past the top (tracked via an IntersectionObserver sentinel, no
// scroll listener) it solidifies into a frosted bar.
export const Navbar: React.FC<NavbarProps> = ({ lastUpdated, overHero = false }) => {
  const [scrolled, setScrolled] = useState(false);
  const [seasonsOpen, setSeasonsOpen] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById('nav-sentinel');
    if (!sentinel) { setScrolled(true); return; }
    const io = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, []);

  const solid = scrolled || !overHero;

  const shell = solid
    ? 'bg-parchment/85 backdrop-blur-md border-b border-warm-border'
    : 'bg-transparent';
  const brand = solid ? 'text-ink hover:text-forest' : 'text-white hover:text-white/80 drop-shadow';
  const link = (active: boolean) =>
    `text-sm font-medium transition-colors ${
      solid
        ? active ? 'text-ink' : 'text-muted hover:text-ink'
        : active ? 'text-white' : 'text-white/80 hover:text-white drop-shadow'
    }`;

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${shell}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className={`font-display font-extrabold text-xl tracking-tight transition-colors ${brand}`}>
          TopBins
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6">
          <NavLink to="/" end className={({ isActive }) => link(isActive)}>Home</NavLink>

          <div className="relative" onMouseLeave={() => setSeasonsOpen(false)}>
            <button
              onClick={() => setSeasonsOpen((v) => !v)}
              onMouseEnter={() => setSeasonsOpen(true)}
              className={`flex items-center gap-1 ${link(false)}`}
            >
              Seasons <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {seasonsOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-stone border border-warm-border rounded-xl shadow-lg overflow-hidden">
                {SEASONS.map((s) => (
                  <NavLink
                    key={s.slug}
                    to={`/g/${s.slug}`}
                    onClick={() => setSeasonsOpen(false)}
                    className="block px-4 py-2.5 text-sm text-muted hover:text-ink hover:bg-beige transition-colors"
                  >
                    {s.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          <NavLink to="/stats" className={({ isActive }) => link(isActive)}>Stats</NavLink>

          {lastUpdated && (
            <span
              className={`hidden sm:inline-flex items-center gap-1.5 text-xs rounded-full px-2.5 py-1 border ${
                solid
                  ? 'text-muted bg-beige border-warm-border'
                  : 'text-white bg-white/15 border-white/25 backdrop-blur-sm'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-forest-mid animate-pulse inline-block" />
              {lastUpdated}
            </span>
          )}
        </nav>
      </div>
    </header>
  );
};
