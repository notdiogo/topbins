import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Dashboard } from './components/Dashboard';
import { LiveLeaderboard } from './components/LiveLeaderboard';
import { AdminGate } from './components/AdminGate';
import { SectionId, Bet, MonthlyStanding } from './types';
import { MOCK_BETS, LEAGUE_HISTORY, LAST_UPDATED } from './constants';
import { fetchBets, fetchLeagueHistory, fetchLastUpdated } from './services/supabaseService';

const App: React.FC = () => {
  const [bets, setBets] = useState<Bet[]>(MOCK_BETS);
  const [leagueHistory, setLeagueHistory] = useState<MonthlyStanding[]>(LEAGUE_HISTORY);
  const [lastUpdated, setLastUpdated] = useState(LAST_UPDATED);
  const [isAdmin, setIsAdmin] = useState(window.location.hash === '#admin');

  useEffect(() => {
    fetchBets().then((data) => { if (data.length > 0) setBets(data); });
    fetchLeagueHistory().then((data) => { if (data.length > 0) setLeagueHistory(data); });
    fetchLastUpdated().then((val) => { if (val) setLastUpdated(val); });
  }, []);

  useEffect(() => {
    const onHashChange = () => setIsAdmin(window.location.hash === '#admin');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const scrollToSection = (id: string) => {
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  if (isAdmin) {
    return (
      <div className="bg-parchment min-h-screen text-ink">
        <AdminGate bets={bets} onBetsChange={setBets} />
      </div>
    );
  }

  return (
    <div className="bg-parchment min-h-screen text-ink">
      <Navbar
        lastUpdated={lastUpdated}
        onNavigate={scrollToSection}
      />
      <main>
        <section id={SectionId.HOME}>
          <Hero onNavigate={scrollToSection} bets={bets} />
        </section>
        <section id={SectionId.DASHBOARD}>
          <Dashboard bets={bets} lastUpdated={lastUpdated} />
        </section>
        <LiveLeaderboard bets={bets} leagueHistory={leagueHistory} />
      </main>
    </div>
  );
};

export default App;
