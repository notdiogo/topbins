import React, { useMemo } from 'react';
import { Bet, MonthlyStanding } from '../types';
import { TrendingUp } from 'lucide-react';

const PARTICIPANTS = [
  { name: 'Diogo', color: '#CCFF00' }, // Neon Yellow
  { name: 'Shiv', color: '#00C2FF' },  // Neon Cyan
  { name: 'Mitch', color: '#FF2E63' }  // Neon Red/Pink
];

export const LiveLeaderboard: React.FC<{ bets: Bet[]; leagueHistory: MonthlyStanding[] }> = ({ bets, leagueHistory }) => {
  // 1. Calculate Current Wins (Keep this for the Live Cards)
  const currentWins = useMemo(() => {
    const wins: Record<string, number> = { Diogo: 0, Shiv: 0, Mitch: 0 };

    bets.forEach(bet => {
        if (bet.status !== 'ACTIVE') return;

        let winningSide: 'A' | 'B' | null = null;
        const { metrics } = bet;
        if (!metrics) return;

        const { valueA, valueB = 0, target, isInverse } = metrics;

        if (bet.type === 'PLAYER_THRESHOLD') {
            // For threshold: If valueA >= target, A wins. Else B wins (assuming B is betting against).
            // Logic derived from "Cunha Target": 1 < 20. B wins.
            if (target) {
                if (valueA >= target) winningSide = 'A';
                else winningSide = 'B';
            }
        } else {
            // PVP
            if (valueA === valueB) return; // Draw
            
            if (isInverse) {
                // Lower is better
                if (valueA < valueB) winningSide = 'A';
                else winningSide = 'B';
            } else {
                // Higher is better
                if (valueA > valueB) winningSide = 'A';
                else winningSide = 'B';
            }
        }

        if (winningSide) {
            bet.participants.forEach(p => {
                if (p.side === winningSide) {
                     if (wins[p.name as keyof typeof wins] !== undefined) {
                         wins[p.name as keyof typeof wins]++;
                     }
                }
            });
        }
    });
    return wins;
  }, [bets]);

  // 2. Prepare Graph Data from leagueHistory prop
  const historyData = leagueHistory.map(entry => ({
      month: entry.month,
      values: entry.scores
  }));

  // Graph Helpers
  const maxVal = Math.max(
      ...historyData.flatMap(d => Object.values(d.values)), 
      4
  ); 
  
  const graphHeight = 100;
  const graphWidth = 300;
  const yAxisWidth = 30; // Space for numbers on the left

  const getX = (index: number) => {
      // Start slightly after the y-axis width (yAxisWidth)
      // BUT inside the SVG, x=0 is the left edge of the SVG.
      // The SVG is inside the "flex-1" container, which is to the RIGHT of the y-axis div.
      // So x=0 in SVG corresponds to the start of the grid.
      // We don't need to add yAxisWidth here if we are rendering inside the SVG which is already offset by flex layout.
      
      const width = graphWidth - yAxisWidth; 
      
      if (historyData.length <= 1) return width / 2;
      
      return (index * width / (historyData.length - 1));
  };

    const getY = (value: number) => {
        // Ensure values map precisely to height
        // value=0 -> graphHeight
        // value=maxVal -> 0
        return graphHeight - ((value / maxVal) * graphHeight);
    };

  const generatePath = (participantName: string) => {
      return historyData.map((d, i) => {
          const val = d.values[participantName as keyof typeof d.values];
          const x = getX(i);
          const y = getY(val);
          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      }).join(' ');
  };

  return (
    <section className="py-24 bg-[#0a0a0a] border-t border-white/5">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
            <div>
                <h2 className="text-4xl md:text-5xl font-black uppercase italic text-white tracking-tighter mb-2">
                    Leaderboard <span className="text-transparent text-stroke-white">Standings</span>
                </h2>
                <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">
                    Live Performance Tracker // Season 2025-26
                </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-[#CCFF00]">
                <TrendingUp className="w-5 h-5" />
                <span className="font-bold uppercase tracking-widest text-xs">Live Updates</span>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* LEFT: Cards */}
            <div className="lg:col-span-5 grid grid-cols-1 gap-4">
                {PARTICIPANTS.sort((a,b) => currentWins[b.name as keyof typeof currentWins] - currentWins[a.name as keyof typeof currentWins]).map((p) => (
                    <div 
                        key={p.name}
                        className="relative group bg-zinc-900 border border-white/10 p-6 flex items-center justify-between overflow-hidden hover:border-white/20 transition-all"
                    >
                        {/* Rank Badge */}
                        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: p.color }}></div>
                        
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 font-black italic text-xl text-gray-500">
                                {p.name[0]}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white uppercase tracking-tight">{p.name}</h3>
                                <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></span>
                                    <span>Active Member</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-4xl font-black italic text-white leading-none">
                                {currentWins[p.name as keyof typeof currentWins]}
                            </div>
                            <div className="text-[10px] font-mono uppercase text-gray-500 tracking-widest mt-1">
                                Bets Winning
                            </div>
                        </div>

                        {/* Hover Effect */}
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    </div>
                ))}
            </div>

            {/* RIGHT: Graph */}
            <div className="lg:col-span-7 bg-zinc-900/50 border border-white/5 p-8 relative flex flex-col">
                <div className="flex justify-between items-start mb-8">
                    <h3 className="font-mono text-xs text-gray-500 uppercase tracking-widest">Performance Trajectory</h3>
                    <div className="flex gap-4">
                        {PARTICIPANTS.map(p => (
                            <div key={p.name} className="flex items-center gap-2">
                                {/* Matched color to participant line color */}
                                <div className="w-3 h-1" style={{ backgroundColor: p.color }}></div>
                                <span className="text-[10px] font-mono text-gray-400 uppercase">{p.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1 w-full min-h-[200px] relative flex">
                    
                    {/* Y Axis Labels (Left Side) */}
                    <div className="flex flex-col justify-between h-full text-right w-[30px] border-r border-white/5 mr-4 relative">
                         {/* Generate labels based on maxVal (0 to maxVal) */}
                         {/* We position them absolutely to match the SVG coordinates exact height */}
                         {[...Array(5)].map((_, i) => {
                            const val = Math.round(maxVal - (i * (maxVal / 4)));
                            return (
                                <div key={i} className="text-[10px] font-mono text-gray-600 absolute right-2 transform -translate-y-1/2" style={{ top: `${(i / 4) * 100}%` }}>
                                    {val}
                                </div>
                            );
                         })}
                    </div>

                    <div className="flex-1 relative">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-full h-px bg-white/5 absolute left-0 right-0 transform -translate-y-1/2" style={{ top: `${(i / 4) * 100}%` }}></div>
                            ))}
                        </div>

                        {/* Chart */}
                        <svg viewBox={`0 0 ${graphWidth - yAxisWidth} ${graphHeight}`} className="w-full h-full overflow-visible preserve-3d">
                            {PARTICIPANTS.map(p => (
                                <g key={p.name}>
                                    {/* Line */}
                                    <path 
                                        d={generatePath(p.name)} 
                                        fill="none" 
                                        stroke={p.color} 
                                        strokeWidth="3" 
                                        vectorEffect="non-scaling-stroke"
                                        className="drop-shadow-lg"
                                    />
                                    {/* Points */}
                                    {historyData.map((d, i) => {
                                        const val = d.values[p.name as keyof typeof d.values];
                                        const x = getX(i);
                                        const y = getY(val);
                                        return (
                                            <circle 
                                                key={i} 
                                                cx={x} 
                                                cy={y} 
                                                r="4" 
                                                fill="#0a0a0a" 
                                                stroke={p.color} 
                                                strokeWidth="2" 
                                                className="hover:r-6 transition-all cursor-crosshair"
                                            />
                                        );
                                    })}
                                </g>
                            ))}
                        </svg>

                        {/* X Axis Labels */}
                        <div className="absolute top-full left-0 right-0 h-6 mt-4">
                             {historyData.map((d, i) => {
                                let leftPos = '50%';
                                if (historyData.length > 1) {
                                    leftPos = `${(i / (historyData.length - 1)) * 100}%`;
                                }
                                return (
                                    <div 
                                        key={i} 
                                        className="absolute text-[10px] font-mono text-gray-600 uppercase text-center transform -translate-x-1/2" 
                                        style={{ 
                                            left: leftPos,
                                            width: '40px' 
                                        }}
                                    >
                                        {d.month}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

