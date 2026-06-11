import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { computeRecords, computeTotals, winRate } from '../lib/stats';
import { predictionPoints, bracketPoints, wcStandings } from '../lib/scoring';
import { Reveal } from '../components/Reveal';
import { CountUp } from '../components/CountUp';
import { Trophy, TrendingUp } from 'lucide-react';

const PERSON_VAR: Record<string, string> = {
  Diogo: 'var(--p-diogo)',
  Shiv: 'var(--p-shiv)',
  Mitch: 'var(--p-mitch)',
};
const personColor = (name: string) => `rgb(${PERSON_VAR[name] ?? 'var(--accent)'})`;

const StatTile: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="bg-stone border border-warm-border rounded-2xl p-5">
    <div className="font-mono text-3xl sm:text-4xl font-bold text-ink tabular-nums leading-none">
      <CountUp value={value} />
    </div>
    <div className="text-xs text-muted mt-2">{label}</div>
  </div>
);

export const StatsPage: React.FC = () => {
  const { bets, predictions, bracketEntries, bracketActual } = useData();
  const totals = useMemo(() => computeTotals(bets), [bets]);
  const records = useMemo(() => computeRecords(bets), [bets]);
  const wc = useMemo(
    () => wcStandings(predictionPoints(predictions), bracketPoints(bracketEntries, bracketActual)),
    [predictions, bracketEntries, bracketActual],
  );

  const sorted = [...records].sort((a, b) => b.won - a.won || winRate(b) - winRate(a));

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
      <div className="mb-8 pb-5 border-b border-warm-border">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-ink">Stats</h1>
        <p className="text-sm text-muted mt-1">All-time record across every group</p>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-12">
        <StatTile label="Bets placed" value={totals.total} />
        <StatTile label="Active" value={totals.active} />
        <StatTile label="Settled" value={totals.settled} />
        <StatTile label="Push" value={totals.push} />
        <StatTile label="Void" value={totals.void} />
      </div>

      {/* World Cup 2026 points */}
      <div className="flex items-center gap-2 mb-5">
        <Trophy className="w-4 h-4 text-forest" />
        <h2 className="font-display text-2xl font-bold text-ink">World Cup 2026 points</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        {wc.map((s, rank) => {
          const color = personColor(s.name);
          return (
            <Reveal key={s.name} delay={rank * 70}>
              <div className="bg-stone rounded-2xl border border-warm-border p-6 h-full" style={{ borderTopColor: color, borderTopWidth: 4 }}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink text-lg">{s.name}</span>
                  <span className="font-mono text-3xl font-bold tabular-nums" style={{ color }}><CountUp value={s.total} /></span>
                </div>
                <div className="mt-3 flex gap-4 text-xs text-muted">
                  <span><span className="font-mono font-semibold text-ink">{s.predictions}</span> predictions</span>
                  <span><span className="font-mono font-semibold text-ink">{s.brackets}</span> brackets</span>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* Per-person records */}
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp className="w-4 h-4 text-forest" />
        <h2 className="font-display text-2xl font-bold text-ink">Head-to-head record</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sorted.map((rec, rank) => {
          const color = personColor(rec.name);
          const decided = rec.won + rec.lost;
          const wr = winRate(rec);
          return (
            <Reveal key={rec.name} delay={rank * 70}>
              <div
                className="bg-stone rounded-2xl border border-warm-border p-6 h-full"
                style={{ borderTopColor: color, borderTopWidth: 4 }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-12 h-12 rounded-full grid place-items-center text-white font-display font-bold text-xl shrink-0"
                    style={{ backgroundColor: color }}
                  >
                    {rec.name[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-ink text-lg leading-tight truncate">{rec.name}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="inline-grid place-items-center w-5 h-5 rounded-full bg-beige border border-warm-border text-[11px] font-bold text-muted font-tabular">
                        {rank + 1}
                      </span>
                      <span className="text-xs text-muted">
                        {rank === 0 ? 'Top record' : `${rank + 1}${rank === 1 ? 'nd' : 'rd'}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Win rate bar */}
                <div className="flex justify-between text-xs text-muted mb-1.5">
                  <span>Win rate</span>
                  <span className="font-tabular font-semibold text-ink">{wr}%</span>
                </div>
                <div className="h-2.5 w-full bg-beige rounded-full overflow-hidden border border-warm-border mb-5">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${wr}%`, backgroundColor: color }} />
                </div>

                {/* W / L / Void / In play */}
                <div className="grid grid-cols-4 gap-2 text-center font-tabular">
                  <div>
                    <div className="font-mono text-2xl font-bold text-forest tabular-nums"><CountUp value={rec.won} /></div>
                    <div className="text-[10px] text-muted mt-0.5">Won</div>
                  </div>
                  <div>
                    <div className="font-mono text-2xl font-bold text-muted tabular-nums"><CountUp value={rec.lost} /></div>
                    <div className="text-[10px] text-muted mt-0.5">Lost</div>
                  </div>
                  <div>
                    <div className="font-mono text-2xl font-bold text-ink tabular-nums"><CountUp value={rec.void} /></div>
                    <div className="text-[10px] text-muted mt-0.5">Void</div>
                  </div>
                  <div>
                    <div className="font-mono text-2xl font-bold text-forest tabular-nums"><CountUp value={rec.leading} /></div>
                    <div className="text-[10px] text-muted mt-0.5">In play</div>
                  </div>
                </div>
                <p className="text-xs text-muted mt-4">{decided} settled {decided === 1 ? 'bet' : 'bets'} counted</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </main>
  );
};
