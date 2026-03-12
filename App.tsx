import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Dashboard } from './components/Dashboard';
import { LiveLeaderboard } from './components/LiveLeaderboard';
import { SectionId, Bet, MonthlyStanding } from './types';
import { MOCK_BETS, LEAGUE_HISTORY, LAST_UPDATED } from './constants';
import { fetchBets, fetchLeagueHistory, fetchLastUpdated } from './services/supabaseService';

const App: React.FC = () => {
  const [bets, setBets] = useState<Bet[]>(MOCK_BETS);
  const [leagueHistory, setLeagueHistory] = useState<MonthlyStanding[]>(LEAGUE_HISTORY);
  const [lastUpdated, setLastUpdated] = useState(LAST_UPDATED);

  useEffect(() => {
    fetchBets().then((data) => { if (data.length > 0) setBets(data); });
    fetchLeagueHistory().then((data) => { if (data.length > 0) setLeagueHistory(data); });
    fetchLastUpdated().then((val) => { if (val) setLastUpdated(val); });
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-parchment min-h-screen text-ink">
      <Navbar lastUpdated={lastUpdated} onNavigate={scrollToSection} />
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
