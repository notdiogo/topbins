
import React, { useState } from 'react';
import { MOCK_BETS } from '../constants';
import { BetListRow } from './BetListRow';
import { BetModal } from './BetModal';
import { Bet } from '../types';
import { Clock } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBetClick = (bet: Bet) => {
    setSelectedBet(bet);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedBet(null), 300); // Wait for animation
  };

  return (
    <section className="py-12 bg-[#080808] text-white relative min-h-screen">
      
      {/* Background Tech Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8 sm:mb-12 border-b-2 border-white/10 pb-6">
           <div>
             <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase italic text-white tracking-tighter">
                Active <span className="text-[#CCFF00]">Ledger</span>
             </h2>
           </div>
           <div className="flex items-center gap-2 text-xs font-mono text-gray-500 uppercase tracking-widest">
              <Clock className="w-4 h-4" />
              Last updated: Mon Nov 24
           </div>
        </div>

        {/* List View */}
        <div className="flex flex-col border-t border-white/10">
          {MOCK_BETS.map((bet) => (
            <BetListRow 
              key={bet.id} 
              bet={bet} 
              onClick={() => handleBetClick(bet)} 
            />
          ))}
        </div>

        {/* Empty State */}
        {MOCK_BETS.length === 0 && (
          <div className="py-32 text-center border border-dashed border-white/10 rounded-sm bg-white/5">
            <p className="font-mono text-[#CCFF00] text-sm">/// NO ACTIVE MARKETS DETECTED</p>
          </div>
        )}

      </div>

      {/* Detail Modal */}
      <BetModal 
        bet={selectedBet} 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />
    </section>
  );
};
