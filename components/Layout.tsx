import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useData } from '../context/DataContext';

export const Layout: React.FC = () => {
  const { lastUpdated } = useData();
  return (
    <div className="bg-parchment min-h-[100dvh] text-ink">
      <Navbar lastUpdated={lastUpdated} />
      <Outlet />
    </div>
  );
};
