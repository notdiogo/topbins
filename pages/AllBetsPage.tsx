import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { BetList } from '../components/BetList';
import { getGroupSummaries, matchesStatusFilter, StatusFilter, GROUP_KIND_LABEL } from '../lib/groups';

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'SETTLED', label: 'Settled & Void' },
];

export const AllBetsPage: React.FC = () => {
  const { bets } = useData();
  const [filter, setFilter] = useState<StatusFilter>('ALL');

  const filtered = useMemo(() => bets.filter((b) => matchesStatusFilter(b, filter)), [bets, filter]);
  const groups = useMemo(() => getGroupSummaries(filtered), [filtered]);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 pb-5 border-b border-warm-border">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-ink">The Ledger</h1>
          <p className="text-sm text-muted mt-1">{filtered.length} {filtered.length === 1 ? 'bet' : 'bets'} across all groups</p>
        </div>
        <div className="inline-flex items-center gap-1 bg-beige border border-warm-border rounded-full p-1 self-start">
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

      {groups.length === 0 ? (
        <BetList bets={[]} emptyMessage="No bets match this filter." />
      ) : (
        <div className="flex flex-col gap-10">
          {groups.map((g) => (
            <section key={g.slug}>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <Link to={`/g/${g.slug}`} className="font-display text-xl md:text-2xl font-bold text-ink hover:text-forest transition-colors">
                    {g.name}
                  </Link>
                  <p className="text-xs text-muted mt-0.5">{GROUP_KIND_LABEL[g.kind]}</p>
                </div>
                <Link to={`/g/${g.slug}`} className="text-xs font-semibold text-forest hover:underline shrink-0">
                  View group →
                </Link>
              </div>
              <BetList bets={filtered.filter((b) => b.group.slug === g.slug)} />
            </section>
          ))}
        </div>
      )}
    </main>
  );
};
