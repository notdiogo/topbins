import React from 'react';
import { Bet } from '../types';
import { ChevronRight } from 'lucide-react';

const ordinal = (n: number) => {
  const j = n % 10, k = n % 100;
  if (j === 1 && k !== 11) return `${n}st`;
  if (j === 2 && k !== 12) return `${n}nd`;
  if (j === 3 && k !== 13) return `${n}rd`;
  return `${n}th`;
};

const formatVal = (val: number, isInverse?: boolean) =>
  isInverse ? ordinal(val) : String(val);

interface BetListRowProps {
  bet: Bet;
  onClick: () => void;
}

export const BetListRow: React.FC<BetListRowProps> = ({ bet, onClick }) => {
  const entityA = bet.entities.find(e => e.side === 'A');
  const entityB = bet.entities.find(e => e.side === 'B');
  const sideA = bet.participants.filter(p => p.side === 'A').map(p => p.name).join(' & ');
  const sideB = bet.participants.filter(p => p.side === 'B').map(p => p.name).join(' & ');

  const { metrics } = bet;
  const valueA = metrics?.valueA ?? 0;
  const valueB = metrics?.valueB ?? 0;
  const target = metrics?.target;
  const isInverse = metrics?.isInverse;
  const maxValue = metrics?.maxValue;

  const isWinningA = target
    ? valueA >= target
    : isInverse ? valueA < valueB : valueA > valueB;

  const isWinningB = !target && (isInverse ? valueB < valueA : valueB > valueA);
  const isTied = !target && valueA === valueB;

  const getBarWidth = (val: number, other: number) => {
    if (target) return Math.min(100, (val / target) * 100);
    if (isInverse) {
      const max = maxValue ?? 20;
      return Math.max(5, Math.min(100, ((max - val + 1) / max) * 100));
    }
    const max = Math.max(val, other, 1);
    return Math.min(100, (val / max) * 100);
  };

  const statusBadge = {
    ACTIVE:  { dot: 'bg-forest animate-pulse', text: 'text-forest',  bg: 'bg-forest-light border-forest/20' },
    SETTLED: { dot: 'bg-muted',                text: 'text-muted',   bg: 'bg-beige border-warm-border' },
    VOID:    { dot: 'bg-danger',               text: 'text-danger',  bg: 'bg-danger-light border-danger/20' },
    PENDING: { dot: 'bg-amber-500',            text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  }[bet.status] ?? { dot: 'bg-muted', text: 'text-muted', bg: 'bg-beige border-warm-border' };

  return (
    <div
      onClick={onClick}
      className="group bg-stone border border-warm-border rounded-xl shadow-sm hover:shadow-md hover:border-forest/40 transition-all duration-200 cursor-pointer overflow-hidden"
    >
      {/* Green left accent bar on hover */}
      <div className="flex flex-col sm:flex-row">

        {/* LEFT accent stripe */}
        <div className="hidden sm:block w-1 bg-warm-border group-hover:bg-forest transition-colors rounded-l-xl" />

        <div className="flex-1 p-5 md:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6">

          {/* Entity avatars */}
          <div className="flex items-center gap-2 shrink-0">
            <div className={`relative rounded-full border-2 overflow-hidden w-12 h-12 sm:w-14 sm:h-14 bg-beige ${isWinningA || !metrics ? 'border-forest' : 'border-warm-border'}`}>
              <img src={entityA?.image} alt={entityA?.name} className="w-full h-full object-cover" />
            </div>
            {entityB && (
              <>
                <span className="text-xs font-bold text-muted">vs</span>
                <div className={`relative rounded-full border-2 overflow-hidden w-12 h-12 sm:w-14 sm:h-14 bg-beige ${isWinningB ? 'border-forest' : 'border-warm-border'}`}>
                  <img src={entityB?.image} alt={entityB?.name} className="w-full h-full object-cover" />
                </div>
              </>
            )}
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0 flex flex-col gap-3">

            {/* Title row */}
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs text-muted bg-beige border border-warm-border px-2 py-0.5 rounded-full font-medium">
                    {bet.league}
                  </span>
                </div>
                <h3 className="font-serif text-xl md:text-2xl font-bold text-ink leading-snug group-hover:text-forest transition-colors">
                  {bet.title}
                </h3>
              </div>
              {/* Status badge */}
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${statusBadge.bg} ${statusBadge.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                {bet.status}
              </span>
            </div>

            {/* Metrics visualization */}
            {metrics && (
              <div className="flex flex-col gap-2">
                {bet.type === 'PLAYER_THRESHOLD' && target ? (
                  // Threshold bet: single bar
                  <div>
                    <div className="flex justify-between text-xs text-muted mb-1.5">
                      <span>{metrics.label}</span>
                      <span className="font-tabular font-semibold text-ink">{valueA} / {target}</span>
                    </div>
                    <div className="h-2.5 w-full bg-beige rounded-full overflow-hidden border border-warm-border">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isWinningA ? 'bg-forest' : 'bg-muted'}`}
                        style={{ width: `${getBarWidth(valueA, 0)}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  // PvP bet: two bars
                  <div className="flex flex-col gap-1.5">
                    {/* Player A */}
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs text-muted w-20 truncate shrink-0">{entityA?.name.split(' ').pop()}</span>
                      <div className="flex-1 h-2.5 bg-beige rounded-full overflow-hidden border border-warm-border">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isWinningA ? 'bg-forest' : 'bg-muted/40'}`}
                          style={{ width: `${getBarWidth(valueA, valueB)}%` }}
                        />
                      </div>
                      <span className={`text-sm font-tabular font-bold w-8 text-right shrink-0 ${isWinningA ? 'text-forest' : 'text-muted'}`}>
                        {formatVal(valueA, isInverse)}
                      </span>
                    </div>
                    {/* Player B */}
                    {entityB && (
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs text-muted w-20 truncate shrink-0">{entityB?.name.split(' ').pop()}</span>
                        <div className="flex-1 h-2.5 bg-beige rounded-full overflow-hidden border border-warm-border">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isWinningB ? 'bg-forest' : 'bg-muted/40'}`}
                            style={{ width: `${getBarWidth(valueB, valueA)}%` }}
                          />
                        </div>
                        <span className={`text-sm font-tabular font-bold w-8 text-right shrink-0 ${isWinningB ? 'text-forest' : 'text-muted'}`}>
                          {formatVal(valueB, isInverse)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Metric label + quick summary */}
                <div className="flex items-center justify-between text-xs text-muted mt-0.5">
                  <span>{metrics.label}</span>
                  {isTied && <span className="text-amber-600 font-semibold">Tied</span>}
                  {!isTied && isWinningA && entityA && (
                    <span className="text-forest font-semibold">{entityA.name.split(' ').pop()} leads</span>
                  )}
                  {!isTied && isWinningB && entityB && (
                    <span className="text-forest font-semibold">{entityB.name.split(' ').pop()} leads</span>
                  )}
                </div>
              </div>
            )}

            {/* Participants + prize row */}
            <div className="flex items-end justify-between gap-2 flex-wrap pt-1 border-t border-warm-border/60">
              <div className="text-xs text-muted leading-relaxed">
                <span className="font-medium text-ink">{sideA}</span> backs {entityA?.name.split(' ').pop()}
                {sideB && entityB && (
                  <> · <span className="font-medium text-ink">{sideB}</span> backs {entityB?.name.split(' ').pop()}</>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-muted shrink-0">
                <span className="text-xs truncate max-w-[150px] text-right">{bet.prize}</span>
                <ChevronRight className="w-4 h-4 group-hover:text-forest transition-colors shrink-0" />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
