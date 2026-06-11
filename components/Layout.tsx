import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useData } from '../context/DataContext';

export const Layout: React.FC = () => {
  const { lastUpdated } = useData();
  const isHome = useLocation().pathname === '/';

  return (
    <div className="relative min-h-[100dvh] bg-parchment text-ink">
      {/* Sentinel the navbar observes to know when the page has scrolled. */}
      <div id="nav-sentinel" className="absolute top-0 left-0 h-1 w-px" aria-hidden />
      <Navbar lastUpdated={lastUpdated} overHero={isHome} />
      {/* Home hero sits under the floating bar; other routes get a top offset. */}
      <div className={isHome ? '' : 'pt-16'}>
        <Outlet />
      </div>
    </div>
  );
};
