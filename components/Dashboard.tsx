import React, { useState } from 'react';
import { BetListRow } from './BetListRow';
import { BetModal } from './BetModal';
import { Bet } from '../types';
import { Clock } from 'lucide-react';

export const Dashboard: React.FC<{ bets: Bet[]; lastUpdated: string }> = ({ bets, lastUpdated }) => {
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBetClick = (bet: Bet) => {
    setSelectedBet(bet);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedBet(null), 300);
  };

  return (
    <section className="bg-parchment py-10 md:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 pb-5 border-b border-warm-border">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-ink">Active Bets</h2>
            <p className="text-sm text-muted mt-1">Season 2025–26</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Clock className="w-3.5 h-3.5" />
            <span>Updated {lastUpdated}</span>
          </div>
        </div>

        {/* Bet list */}
        <div className="flex flex-col gap-3">
          {bets.map(bet => (
            <BetListRow key={bet.id} bet={bet} onClick={() => handleBetClick(bet)} />
          ))}
        </div>

        {bets.length === 0 && (
          <div className="py-20 text-center border border-dashed border-warm-border rounded-xl bg-stone">
            <p className="text-muted text-sm">No active bets right now.</p>
          </div>
        )}
      </div>

      <BetModal bet={selectedBet} isOpen={isModalOpen} onClose={handleCloseModal} />
    </section>
  );
};
