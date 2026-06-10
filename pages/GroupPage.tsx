import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { BetList } from '../components/BetList';
import { getGroupSummaries, matchesStatusFilter, StatusFilter, GROUP_KIND_LABEL } from '../lib/groups';
import { computeRecords, winRate } from '../lib/stats';

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'SETTLED', label: 'Settled & Void' },
];

export const GroupPage: React.FC = () => {
  const { groupSlug } = useParams<{ groupSlug: string }>();
  const { bets } = useData();
  const [filter, setFilter] = useState<StatusFilter>('ALL');

  const groupBets = useMemo(() => bets.filter((b) => b.group.slug === groupSlug), [bets, groupSlug]);
  const group = useMemo(() => getGroupSummaries(groupBets)[0], [groupBets]);
  const records = useMemo(() => computeRecords(groupBets), [groupBets]);
  const filtered = useMemo(() => groupBets.filter((b) => matchesStatusFilter(b, filter)), [groupBets, filter]);

  if (groupBets.length === 0 || !group) {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-24 text-center">
        <h1 className="font-display text-4xl font-bold text-ink">Group not found</h1>
        <p className="text-muted mt-3">No bets belong to "{groupSlug}".</p>
        <Link
          to="/bets"
          className="inline-flex items-center gap-2 mt-6 bg-forest text-stone text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-forest-mid transition-colors"
        >
          Back to the ledger
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
      {/* Header */}
      <div className="mb-8 pb-5 border-b border-warm-border">
        <Link to="/bets" className="text-xs font-semibold text-forest hover:underline">← All groups</Link>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mt-2">
          <div>
            <p className="text-xs text-muted">{GROUP_KIND_LABEL[group.kind]}</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-ink mt-1">{group.name}</h1>
            <p className="text-sm text-muted mt-1">
              {group.total} {group.total === 1 ? 'bet' : 'bets'} · {group.active} active · {group.settled} settled
            </p>
          </div>
        </div>
      </div>

      {/* Per-person record snapshot for this group */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
        {records.map((rec) => (
          <div key={rec.name} className="bg-stone border border-warm-border rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-ink">{rec.name}</span>
              <span className="text-xs text-muted font-tabular">{winRate(rec)}% win</span>
            </div>
            <div className="flex items-baseline gap-3 mt-3 font-tabular">
              <span className="text-2xl font-mono font-bold text-forest tabular-nums">{rec.won}<span className="text-xs text-muted font-sans font-normal ml-1">W</span></span>
              <span className="text-2xl font-mono font-bold text-muted tabular-nums">{rec.lost}<span className="text-xs text-muted font-sans font-normal ml-1">L</span></span>
              {rec.leading > 0 && (
                <span className="text-xs text-forest ml-auto self-center">{rec.leading} in play</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="font-display text-xl font-bold text-ink">Bets</h2>
        <div className="inline-flex items-center gap-1 bg-beige border border-warm-border rounded-full p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                filter === f.key ? 'bg-forest text-stone' : 'text-muted hover:text-ink'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <BetList bets={filtered} emptyMessage="No bets match this filter." />
    </main>
  );
};
