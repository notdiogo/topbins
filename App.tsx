import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Dashboard } from './components/Dashboard';
import { LiveLeaderboard } from './components/LiveLeaderboard';
import { LoginPage } from './components/LoginPage';
import { ManagePage } from './components/manage/ManagePage';
import { SectionId, Bet, MonthlyStanding } from './types';
import { MOCK_BETS, LEAGUE_HISTORY, LAST_UPDATED } from './constants';
import { fetchBets, fetchLeagueHistory, fetchLastUpdated } from './services/supabaseService';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
  const { user, isAdmin, isLoading, signIn, signOut } = useAuth();
  const [bets, setBets] = useState<Bet[]>(MOCK_BETS);
  const [leagueHistory, setLeagueHistory] = useState<MonthlyStanding[]>(LEAGUE_HISTORY);
  const [lastUpdated, setLastUpdated] = useState(LAST_UPDATED);
  const [showManage, setShowManage] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchBets().then((data) => { if (data.length > 0) setBets(data); });
    fetchLeagueHistory().then((data) => { if (data.length > 0) setLeagueHistory(data); });
    fetchLastUpdated().then((val) => { if (val) setLastUpdated(val); });
  }, [user]);

  const scrollToSection = (id: string) => {
    setShowManage(false);
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <span className="text-muted text-sm">Loading…</span>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onSignIn={signIn} />;
  }

  return (
    <div className="bg-parchment min-h-screen text-ink">
      <Navbar
        lastUpdated={lastUpdated}
        onNavigate={scrollToSection}
        isAdmin={isAdmin}
        onManage={() => setShowManage(true)}
        onSignOut={signOut}
      />
      <main>
        {showManage ? (
          <ManagePage bets={bets} onBetsChange={setBets} />
        ) : (
          <>
            <section id={SectionId.HOME}>
              <Hero onNavigate={scrollToSection} bets={bets} />
            </section>
            <section id={SectionId.DASHBOARD}>
              <Dashboard bets={bets} lastUpdated={lastUpdated} />
            </section>
            <LiveLeaderboard bets={bets} leagueHistory={leagueHistory} />
          </>
        )}
      </main>
    </div>
  );
};

export default App;
