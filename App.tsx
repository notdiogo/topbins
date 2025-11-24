import React from 'react';
import { Hero } from './components/Hero';
import { Dashboard } from './components/Dashboard';
import { LiveLeaderboard } from './components/LiveLeaderboard';
import { SectionId } from './types';

const App: React.FC = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-zinc-900 min-h-screen text-white selection:bg-[#CCFF00] selection:text-black">
      
      <main className="">
        <section id={SectionId.HOME}>
          <Hero onNavigate={scrollToSection} />
        </section>

        <section id={SectionId.DASHBOARD}>
          <Dashboard />
        </section>

        <LiveLeaderboard />
      </main>
    </div>
  );
};

export default App;