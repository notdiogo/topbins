import React, { useState } from 'react';
import { Bet } from '../types';
import { BetListRow } from './BetListRow';
import { BetModal } from './BetModal';

interface BetListProps {
  bets: Bet[];
  emptyMessage?: string;
}

// Renders a list of bet rows and owns the detail-modal state.
// Shared by the Home dashboard, the Ledger, and per-group pages.
export const BetList: React.FC<BetListProps> = ({ bets, emptyMessage = 'No bets here yet.' }) => {
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

  if (bets.length === 0) {
    return (
      <div className="py-16 text-center border border-dashed border-warm-border rounded-xl bg-stone">
        <p className="text-muted text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {bets.map((bet) => (
          <BetListRow key={bet.id} bet={bet} onClick={() => handleBetClick(bet)} />
        ))}
      </div>
      <BetModal bet={selectedBet} isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
};
