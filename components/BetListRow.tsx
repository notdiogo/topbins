
import React from 'react';
import { Bet } from '../types';
import { ChevronRight } from 'lucide-react';

interface BetListRowProps {
  bet: Bet;
  onClick: () => void;
}

export const BetListRow: React.FC<BetListRowProps> = ({ bet, onClick }) => {
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'SETTLED': return 'text-[#CCFF00]';
      case 'VOID': return 'text-red-500';
      case 'ACTIVE': return 'text-white';
      default: return 'text-gray-400';
    }
  };

  // Helper for entity images
  const entityA = bet.entities.find(e => e.side === 'A');
  const entityB = bet.entities.find(e => e.side === 'B');

  // Helper for participant names
  const sideA = bet.participants.filter(p => p.side === 'A').map(p => p.name).join(' & ');
  const sideB = bet.participants.filter(p => p.side === 'B').map(p => p.name).join(' & ');

  return (
    <div 
      onClick={onClick}
      className="group w-full bg-[#0a0a0a] border-b border-white/5 hover:bg-[#111] hover:border-[#CCFF00] transition-all duration-300 cursor-pointer relative overflow-hidden"
    >
      {/* Hover Accent Bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#CCFF00] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>

      <div className="flex flex-col md:flex-row items-stretch min-h-[120px]">
        
        {/* LEFT COL: Visuals (Headshots) */}
        <div className="md:w-64 p-4 flex items-center justify-center md:justify-start gap-4 bg-black/20 md:border-r border-white/5 relative overflow-hidden">
           
           {/* Background glow on hover */}
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

           <div className="flex items-center relative z-10 pl-4">
              {/* Player A Avatar */}
              <div className={`w-16 h-16 rounded-full border-2 overflow-hidden relative z-20 shadow-lg bg-zinc-800 ${
                bet.metrics?.target 
                  ? ((bet.metrics.valueA || 0) >= bet.metrics.target ? 'border-[#CCFF00]' : 'border-white/20')
                  : (!bet.metrics || (bet.metrics.valueA || 0) > (bet.metrics.valueB || 0) ? 'border-[#CCFF00]' : 'border-white/20')
              }`}>
                 <img src={entityA?.image} alt={entityA?.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
              </div>
              
              {/* VS Element - Only show if there is a Side B entity */}
              {entityB && (
                <>
                  <div className="relative z-30 -ml-3 bg-black border border-white/20 text-[10px] font-black text-white px-1 italic transform -skew-x-12">VS</div>

                  {/* Player B Avatar */}
                  <div className={`w-16 h-16 rounded-full border-2 overflow-hidden relative z-10 -ml-3 bg-zinc-800 ${
                    bet.metrics && (bet.metrics.valueB || 0) > (bet.metrics.valueA || 0) ? 'border-[#CCFF00]' : 'border-white/20'
                  }`}>
                     <img src={entityB?.image} alt={entityB?.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                  </div>
                </>
              )}
           </div>
        </div>

        {/* MIDDLE COL: Bet Details */}
        <div className="flex-1 p-6 flex flex-col justify-center">
           
           <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest border border-white/10 px-2 py-0.5 rounded-sm">
                {bet.league}
              </span>
           </div>

           <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white group-hover:text-[#CCFF00] transition-colors mb-3 leading-none">
              {bet.title}
           </h3>
           
           {/* VISUALIZATION SECTION */}
           <div className="mb-4 w-full max-w-md">
             {bet.type === 'PLAYER_THRESHOLD' && bet.metrics?.target && (
               <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[10px] font-mono uppercase text-gray-500 mb-1">
                    <span>{bet.metrics.label}</span>
                    <span className="font-bold text-white">{bet.metrics.valueA} / {bet.metrics.target}</span>
                  </div>
                  <div className="h-3 w-full bg-white/10 rounded-sm overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        (bet.metrics.valueA || 0) >= (bet.metrics.target || 0) ? 'bg-[#CCFF00]' : 'bg-white/40'
                      }`}
                      style={{ width: `${Math.min(100, (bet.metrics.valueA / bet.metrics.target) * 100)}%` }}
                    ></div>
                  </div>
               </div>
             )}

             {bet.type === 'PLAYER_VS_PLAYER' && bet.metrics && (
               <div className="flex flex-col gap-2 mt-2">
                  {/* Player A Bar */}
                  <div className="flex items-center gap-3">
                     <div className="flex-1 h-3 bg-white/10 rounded-sm overflow-hidden">
                        <div 
                           className={`h-full transition-all duration-500 ${
                             (bet.metrics.valueA || 0) > (bet.metrics.valueB || 0) 
                               ? 'bg-[#CCFF00]' 
                               : 'bg-white/40'
                           }`}
                           style={{ width: `${Math.min(100, ((bet.metrics.valueA || 0) / Math.max((bet.metrics.valueA || 0), (bet.metrics.valueB || 0), 1)) * 100)}%` }}
                        ></div>
                     </div>
                     <div className={`w-8 text-xs font-mono font-bold text-left ${
                        (bet.metrics.valueA || 0) > (bet.metrics.valueB || 0) ? 'text-[#CCFF00]' : 'text-gray-400'
                     }`}>
                       {bet.metrics.valueA}
                     </div>
                  </div>
                  
                  {/* Player B Bar */}
                  <div className="flex items-center gap-3">
                     <div className="flex-1 h-3 bg-white/10 rounded-sm overflow-hidden">
                        <div 
                           className={`h-full transition-all duration-500 ${
                             (bet.metrics.valueB || 0) > (bet.metrics.valueA || 0) 
                               ? 'bg-[#CCFF00]' 
                               : 'bg-white/40'
                           }`}
                           style={{ width: `${Math.min(100, ((bet.metrics.valueB || 0) / Math.max((bet.metrics.valueA || 0), (bet.metrics.valueB || 0), 1)) * 100)}%` }}
                        ></div>
                     </div>
                     <div className={`w-8 text-xs font-mono font-bold text-left ${
                        (bet.metrics.valueB || 0) > (bet.metrics.valueA || 0) ? 'text-[#CCFF00]' : 'text-gray-400'
                     }`}>
                       {bet.metrics.valueB}
                     </div>
                  </div>
               </div>
             )}
           </div>

           <div className="flex flex-col gap-1 font-mono text-xs text-gray-400">
              <div className="flex items-center gap-2">
                 <span className={`w-2 h-2 rounded-full ${
                   !bet.metrics || (bet.metrics.valueA || 0) > (bet.metrics.valueB || 0) || (bet.metrics.target && (bet.metrics.valueA || 0) >= bet.metrics.target)
                     ? 'bg-[#CCFF00]' 
                     : 'bg-zinc-600'
                 }`}></span>
                 <span className={`${
                   !bet.metrics || (bet.metrics.valueA || 0) > (bet.metrics.valueB || 0) || (bet.metrics.target && (bet.metrics.valueA || 0) >= bet.metrics.target)
                     ? 'text-white font-bold' 
                     : 'text-gray-500'
                 }`}>{sideA}</span>
                 <span className="opacity-50">backs</span>
                 <span className={`${
                   !bet.metrics || (bet.metrics.valueA || 0) > (bet.metrics.valueB || 0) || (bet.metrics.target && (bet.metrics.valueA || 0) >= bet.metrics.target)
                     ? 'text-gray-300' 
                     : 'text-gray-600'
                 } uppercase`}>{entityA?.name.split(' ').pop()}</span>
              </div>
              
              {sideB && (
                <div className="flex items-center gap-2">
                   <span className={`w-2 h-2 rounded-full ${
                     bet.metrics && (bet.metrics.valueB || 0) > (bet.metrics.valueA || 0) 
                       ? 'bg-[#CCFF00]' 
                       : 'bg-zinc-600'
                   }`}></span>
                   <span className={`${
                     bet.metrics && (bet.metrics.valueB || 0) > (bet.metrics.valueA || 0) 
                       ? 'text-white font-bold' 
                       : 'text-gray-500'
                   }`}>{sideB}</span>
                   <span className="opacity-50">backs</span>
                   <span className={`${
                     bet.metrics && (bet.metrics.valueB || 0) > (bet.metrics.valueA || 0) 
                       ? 'text-gray-300' 
                       : 'text-gray-600'
                   } uppercase`}>{entityB?.name.split(' ').pop()}</span>
                </div>
              )}
           </div>
        </div>

        {/* RIGHT COL: Status & Metadata */}
        <div className="md:w-72 bg-black/20 border-l border-white/5 p-6 flex flex-col justify-between items-start md:items-end text-left md:text-right relative">
           
           <div className="flex flex-col items-start md:items-end">
              <div className="font-tech text-xl font-bold text-white mb-1">{bet.season}</div>
              <div className={`inline-flex items-center gap-2 px-2 py-0.5 rounded-sm border border-white/10 bg-white/5`}>
                <div className={`w-1.5 h-1.5 rounded-full ${bet.status === 'ACTIVE' ? 'bg-[#CCFF00] animate-pulse' : 'bg-gray-500'}`}></div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${getStatusColor(bet.status)}`}>{bet.status}</span>
              </div>
           </div>

           <div className="mt-4">
              <span className="text-[10px] text-gray-600 font-mono uppercase block mb-1">Pot/Bounty</span>
              <div className="text-sm text-gray-300 font-bold max-w-[200px] truncate">
                 {bet.prize}
              </div>
           </div>

           <ChevronRight className="absolute bottom-6 right-6 md:left-6 w-5 h-5 text-zinc-700 group-hover:text-[#CCFF00] transition-colors opacity-0 group-hover:opacity-100 md:rotate-0" />
        </div>

      </div>
    </div>
  );
};
