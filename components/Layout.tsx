import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useData } from '../context/DataContext';
import { Hero } from './Hero';

export const Layout: React.FC = () => {
  const { isLoading } = useData();
  const isHome = useLocation().pathname === '/';

  if (isLoading) {
    return (
      <div className="relative min-h-[100dvh] bg-parchment text-ink flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
          <p className="mt-4 text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[100dvh] bg-parchment text-ink">
      {isHome && (
        <>
          <Hero />
          <Navbar />
        </>
      )}
      {!isHome && (
        <>
          <Navbar />
          <div className="pt-16">
            <Outlet />
          </div>
        </>
      )}
      {isHome && <Outlet />}
    </div>
  );
};
