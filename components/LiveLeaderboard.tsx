import React, { useMemo } from 'react';
import { Bet, MonthlyStanding } from '../types';
import { TrendingUp } from 'lucide-react';

const PARTICIPANTS = [
  { name: 'Diogo', color: '#16803C' }, // green-700
  { name: 'Shiv',  color: '#1D4ED8' }, // blue-700
  { name: 'Mitch', color: '#C2410C' }, // orange-700
];

export const LiveLeaderboard: React.FC<{ bets: Bet[]; leagueHistory: MonthlyStanding[] }> = ({ bets, leagueHistory }) => {
  const currentWins = useMemo(() => {
    const wins: Record<string, number> = { Diogo: 0, Shiv: 0, Mitch: 0 };
    bets.forEach(bet => {
      if (bet.status !== 'ACTIVE') return;
      const { metrics } = bet;
      if (!metrics) return;
      const { valueA, valueB = 0, target, isInverse } = metrics;
      let side: 'A' | 'B' | null = null;
      if (bet.type === 'PLAYER_THRESHOLD') {
        if (target) side = valueA >= target ? 'A' : 'B';
      } else {
        if (valueA === valueB) return;
        side = isInverse ? (valueA < valueB ? 'A' : 'B') : (valueA > valueB ? 'A' : 'B');
      }
      if (side) {
        bet.participants.forEach(p => {
          if (p.side === side && wins[p.name] !== undefined) wins[p.name]++;
        });
      }
    });
    return wins;
  }, [bets]);

  const historyData = leagueHistory.map(e => ({ month: e.month, values: e.scores }));
  const maxVal = Math.max(...historyData.flatMap(d => Object.values(d.values)), 4);
  const graphHeight = 100;
  const graphWidth = 270;

  const getX = (i: number) => historyData.length <= 1 ? graphWidth / 2 : (i * graphWidth / (historyData.length - 1));
  const getY = (v: number) => graphHeight - ((v / maxVal) * graphHeight);

  const makePath = (name: string) =>
    historyData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.values[name] ?? 0)}`).join(' ');

  const sorted = [...PARTICIPANTS].sort((a, b) => (currentWins[b.name] ?? 0) - (currentWins[a.name] ?? 0));

  return (
    <section id="standings" className="bg-beige border-t border-warm-border py-10 md:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex items-end justify-between mb-8 pb-5 border-b border-warm-border">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-ink">Standings</h2>
            <p className="text-sm text-muted mt-1">Season 2025–26</p>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-forest text-sm font-semibold">
            <TrendingUp className="w-4 h-4" />
            <span>Live</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT: Participant cards */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {sorted.map((p, rank) => (
              <div
                key={p.name}
                className="bg-stone rounded-xl border border-warm-border p-5 flex items-center justify-between relative overflow-hidden"
                style={{ borderLeftColor: p.color, borderLeftWidth: 4 }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-ink text-lg leading-tight">{p.name}</div>
                    <div className="text-xs text-muted">
                      {rank === 0 ? '🥇 Leading' : rank === 1 ? '🥈 2nd place' : '🥉 3rd place'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-serif text-4xl font-bold text-ink font-tabular leading-none">
                    {currentWins[p.name] ?? 0}
                  </div>
                  <div className="text-xs text-muted mt-1">bets winning</div>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: Chart */}
          <div className="lg:col-span-7 bg-stone rounded-xl border border-warm-border p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-semibold text-muted uppercase tracking-wide">Season trajectory</span>
              <div className="flex gap-4">
                {PARTICIPANTS.map(p => (
                  <div key={p.name} className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-xs text-muted">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 min-h-[180px] flex relative">
              {/* Y axis */}
              <div className="flex flex-col justify-between w-7 shrink-0 mr-3 border-r border-warm-border">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[10px] text-muted text-right pr-2 font-tabular">
                    {Math.round(maxVal - (i * maxVal / 4))}
                  </span>
                ))}
              </div>

              {/* Chart area */}
              <div className="flex-1 relative">
                {/* Grid lines */}
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute left-0 right-0 h-px bg-warm-border"
                    style={{ top: `${(i / 4) * 100}%` }}
                  />
                ))}

                <svg
                  viewBox={`0 0 ${graphWidth} ${graphHeight}`}
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                >
                  {PARTICIPANTS.map(p => (
                    <g key={p.name}>
                      <path
                        d={makePath(p.name)}
                        fill="none"
                        stroke={p.color}
                        strokeWidth="2.5"
                        vectorEffect="non-scaling-stroke"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {historyData.map((d, i) => (
                        <circle
                          key={i}
                          cx={getX(i)}
                          cy={getY(d.values[p.name] ?? 0)}
                          r="4"
                          fill="#FDFBF8"
                          stroke={p.color}
                          strokeWidth="2"
                          vectorEffect="non-scaling-stroke"
                        />
                      ))}
                    </g>
                  ))}
                </svg>

                {/* X labels */}
                {historyData.length > 0 && (
                  <div className="absolute top-full left-0 right-0 flex justify-between mt-2">
                    {historyData.map((d, i) => (
                      <span
                        key={i}
                        className="text-[10px] text-muted uppercase font-tabular"
                        style={{
                          position: 'absolute',
                          left: `${historyData.length <= 1 ? 50 : (i / (historyData.length - 1)) * 100}%`,
                          transform: 'translateX(-50%)',
                        }}
                      >
                        {d.month}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
