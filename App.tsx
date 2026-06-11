import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { GroupPage } from './pages/GroupPage';
import { StatsPage } from './pages/StatsPage';
import { AdminPage } from './pages/AdminPage';
import { NotFound } from './pages/NotFound';

const App: React.FC = () => {
  return (
    <DataProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/g/:groupSlug" element={<GroupPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </DataProvider>
  );
};

export default App;
