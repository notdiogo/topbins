
import React from 'react';
import { Bet } from '../types';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

interface BetCardProps {
  bet: Bet;
}

export const BetCard: React.FC<BetCardProps> = ({ bet }) => {
  // Note: This component is legacy/fallback. Primary view is BetListRow.
  
  const statusConfig = {
    ACTIVE: { color: 'text-yellow-400', border: 'border-yellow-400/50', icon: Clock, bg: 'bg-yellow-400/5' },
    SETTLED: { color: 'text-[#CCFF00]', border: 'border-[#CCFF00]/50', icon: CheckCircle2, bg: 'bg-[#CCFF00]/5' },
    VOID: { color: 'text-gray-400', border: 'border-gray-400/50', icon: AlertCircle, bg: 'bg-gray-400/5' },
    PENDING: { color: 'text-yellow-400', border: 'border-yellow-400/50', icon: Clock, bg: 'bg-yellow-400/5' }
  };

  const config = statusConfig[bet.status] || statusConfig.ACTIVE;
  const Icon = config.icon;

  return (
    <div className={`relative group bg-zinc-900/50 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all duration-300 overflow-hidden p-6 flex flex-col justify-between h-full`}>
      
      <div className={`absolute top-0 left-0 w-1 h-full ${config.color.replace('text-', 'bg-')}`}></div>
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500">{bet.league}</span>
          <span className="text-xs font-mono text-gray-400">{bet.season}</span>
        </div>
        <div className={`flex items-center gap-2 px-2 py-1 rounded-sm ${config.bg} ${config.border} border`}>
           <Icon className={`w-3 h-3 ${config.color}`} />
           <span className={`text-[10px] font-bold uppercase tracking-wider ${config.color}`}>{bet.status}</span>
        </div>
      </div>

      <div className="mb-6 relative z-10">
        <div className="text-xl font-black uppercase italic text-white leading-tight mb-2">{bet.title}</div>
        <div className="text-xs text-gray-400 font-mono line-clamp-2">{bet.criteria}</div>
      </div>

      <div className="relative z-10 border-t border-white/10 pt-4 mt-auto">
        <div className="flex justify-between items-end">
           <div className="text-[10px] text-gray-500 uppercase font-bold">Metric</div>
           <div className="text-right">
             <span className="text-lg font-poster text-[#CCFF00]">{bet.metrics?.label}</span>
           </div>
        </div>
      </div>
    </div>
  );
};
