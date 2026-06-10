import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Hero } from '../components/Hero';
import { BetList } from '../components/BetList';
import { Reveal } from '../components/Reveal';
import { getGroupSummaries, GROUP_KIND_LABEL } from '../lib/groups';
import { computeRecords, winRate } from '../lib/stats';
import { resolveWinners } from '../lib/betOutcome';
import { ArrowRight, Trophy, Activity, History } from 'lucide-react';

const PERSON_VAR: Record<string, string> = {
  Diogo: 'var(--p-diogo)',
  Shiv: 'var(--p-shiv)',
  Mitch: 'var(--p-mitch)',
};
const personColor = (name: string) => `rgb(${PERSON_VAR[name] ?? 'var(--accent)'})`;

const WidgetHeader: React.FC<{ icon: React.ReactNode; title: string; to: string; cta: string }> = ({ icon, title, to, cta }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <span className="text-forest">{icon}</span>
      <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
    </div>
    <Link to={to} className="text-xs font-semibold text-forest hover:underline shrink-0 inline-flex items-center gap-1">
      {cta} <ArrowRight className="w-3.5 h-3.5" />
    </Link>
  </div>
);

const RankChip: React.FC<{ rank: number }> = ({ rank }) => (
  <span className="inline-grid place-items-center w-5 h-5 rounded-full bg-beige border border-warm-border text-[11px] font-bold text-muted font-tabular">
    {rank + 1}
  </span>
);

export const HomePage: React.FC = () => {
  const { bets } = useData();
  const navigate = useNavigate();

  const groups = useMemo(() => getGroupSummaries(bets), [bets]);
  const records = useMemo(() => computeRecords(bets), [bets]);
  const standings = useMemo(() => [...records].sort((a, b) => (b.won + b.leading) - (a.won + a.leading)), [records]);

  const activeBets = useMemo(
    () => bets.filter((b) => b.status === 'ACTIVE' || b.status === 'PENDING').slice(0, 3),
    [bets],
  );
  const activeCount = useMemo(
    () => bets.filter((b) => b.status === 'ACTIVE' || b.status === 'PENDING').length,
    [bets],
  );
  const recentlySettled = useMemo(
    () => bets.filter((b) => b.status === 'SETTLED' || b.status === 'VOID').slice(0, 4),
    [bets],
  );

  return (
    <>
      <Hero onNavigate={() => navigate('/bets')} bets={bets} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14 flex flex-col gap-12">

        {/* Group tiles */}
        <Reveal as="section">
          <WidgetHeader icon={<Trophy className="w-5 h-5" />} title="Competitions" to="/bets" cta="Open the ledger" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((g) => (
              <Link
                key={g.slug}
                to={`/g/${g.slug}`}
                className="group bg-stone border border-warm-border rounded-2xl p-5 hover:shadow-md hover:border-forest/40 transition-all"
              >
                <p className="text-xs text-muted">{GROUP_KIND_LABEL[g.kind]}</p>
                <h3 className="font-display text-2xl font-bold text-ink mt-1 group-hover:text-forest transition-colors">{g.name}</h3>
                <div className="flex items-center gap-3 mt-4 text-sm">
                  <span className="font-tabular font-semibold text-ink">{g.total} bets</span>
                  {g.active > 0 && (
                    <span className="inline-flex items-center gap-1.5 text-forest font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-forest" /> {g.active} active
                    </span>
                  )}
                  {g.settled > 0 && <span className="text-muted">{g.settled} settled</span>}
                </div>
              </Link>
            ))}
          </div>
        </Reveal>

        {/* Standings snapshot + Active bets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Reveal as="section">
            <WidgetHeader icon={<Trophy className="w-5 h-5" />} title="Standings" to="/stats" cta="Full stats" />
            <div className="flex flex-col gap-3">
              {standings.map((rec, rank) => {
                const color = personColor(rec.name);
                return (
                  <div
                    key={rec.name}
                    className="bg-stone rounded-2xl border border-warm-border p-4 flex items-center justify-between gap-3"
                    style={{ borderLeftColor: color, borderLeftWidth: 4 }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-full grid place-items-center text-white font-display font-bold shrink-0"
                        style={{ backgroundColor: color }}
                      >
                        {rec.name[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <RankChip rank={rank} />
                          <span className="font-semibold text-ink leading-tight truncate">{rec.name}</span>
                        </div>
                        <div className="text-xs text-muted mt-0.5 font-tabular">{winRate(rec)}% win rate</div>
                      </div>
                    </div>
                    <div className="text-right font-tabular shrink-0">
                      <div className="font-mono text-xl font-bold text-ink leading-none tabular-nums">
                        {rec.won}<span className="text-sm text-muted">W</span> {rec.lost}<span className="text-sm text-muted">L</span>
                      </div>
                      {rec.leading > 0 && <div className="text-xs text-forest mt-1">{rec.leading} in play</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>

          <Reveal as="section">
            <WidgetHeader icon={<Activity className="w-5 h-5" />} title={`In play${activeCount ? ` (${activeCount})` : ''}`} to="/bets" cta="Open the ledger" />
            <BetList bets={activeBets} emptyMessage="No active bets right now." />
          </Reveal>
        </div>

        {/* Recently settled */}
        <Reveal as="section">
          <WidgetHeader icon={<History className="w-5 h-5" />} title="Recently settled" to="/bets" cta="Open the ledger" />
          {recentlySettled.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-warm-border rounded-2xl bg-stone">
              <p className="text-muted text-sm">Nothing settled yet. The season's just getting going.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentlySettled.map((bet) => {
                const winners = resolveWinners(bet);
                const isVoid = bet.status === 'VOID' || bet.result === 'VOID';
                const isPush = bet.result === 'PUSH';
                return (
                  <div key={bet.id} className="bg-stone border border-warm-border rounded-2xl p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-muted">{bet.group.name}</p>
                      <h3 className="font-display text-base font-bold text-ink leading-snug truncate">{bet.title}</h3>
                    </div>
                    <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border bg-beige border-warm-border text-ink">
                      {isVoid ? 'Void' : isPush ? 'Push' : winners.length ? `${winners.join(' & ')} won` : 'Settled'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Reveal>
      </main>
    </>
  );
};
