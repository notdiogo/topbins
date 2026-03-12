import React, { useEffect } from 'react';
import { Bet } from '../types';
import { X, AlertTriangle, Trophy, Users, Scale } from 'lucide-react';

interface BetModalProps {
  bet: Bet | null;
  isOpen: boolean;
  onClose: () => void;
}

const ordinal = (n: number) => {
  const j = n % 10, k = n % 100;
  if (j === 1 && k !== 11) return `${n}st`;
  if (j === 2 && k !== 12) return `${n}nd`;
  if (j === 3 && k !== 13) return `${n}rd`;
  return `${n}th`;
};

export const BetModal: React.FC<BetModalProps> = ({ bet, isOpen, onClose }) => {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !bet) return null;

  const entityA = bet.entities.find(e => e.side === 'A');
  const entityB = bet.entities.find(e => e.side === 'B');
  const valueA = bet.metrics?.valueA ?? 0;
  const valueB = bet.metrics?.valueB ?? 0;
  const isInverse = bet.metrics?.isInverse;
  const target = bet.metrics?.target;
  const isWinningA = target ? valueA >= target : isInverse ? valueA < valueB : valueA > valueB;
  const isWinningB = !target && (isInverse ? valueB < valueA : valueB > valueA);

  const formatVal = (v: number) => isInverse ? ordinal(v) : String(v);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end md:justify-center md:items-center md:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet / Modal */}
      <div className="relative bg-stone w-full md:max-w-2xl md:rounded-2xl rounded-t-3xl shadow-2xl max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom-4 md:zoom-in-95 duration-300">

        {/* Handle (mobile) */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-warm-border" />
        </div>

        {/* Header */}
        <div className="sticky top-0 bg-stone border-b border-warm-border px-6 py-4 flex items-start justify-between gap-4 z-10">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-medium text-muted bg-beige border border-warm-border px-2 py-0.5 rounded-full">
                {bet.league}
              </span>
              <span className="text-xs text-muted">{bet.season}</span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-ink leading-tight">
              {bet.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-2 rounded-lg text-muted hover:text-ink hover:bg-beige transition-colors border border-warm-border mt-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">

          {/* Entity cards with current score */}
          {(entityA || entityB) && (
            <div className="grid grid-cols-2 gap-3">
              {entityA && (
                <div className={`rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-colors ${isWinningA || !bet.metrics ? 'border-forest bg-forest-light' : 'border-warm-border bg-beige'}`}>
                  <img src={entityA.image} alt={entityA.name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                  <span className="text-xs text-muted text-center">Side A</span>
                  <span className="font-serif font-bold text-ink text-center text-sm leading-tight">{entityA.name}</span>
                  {bet.metrics && (
                    <span className={`text-3xl font-bold font-tabular ${isWinningA ? 'text-forest' : 'text-ink'}`}>
                      {formatVal(valueA)}
                    </span>
                  )}
                  {isWinningA && bet.metrics && <span className="text-xs font-semibold text-forest">Leading</span>}
                </div>
              )}
              {entityB && (
                <div className={`rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-colors ${isWinningB ? 'border-forest bg-forest-light' : 'border-warm-border bg-beige'}`}>
                  <img src={entityB.image} alt={entityB.name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                  <span className="text-xs text-muted text-center">Side B</span>
                  <span className="font-serif font-bold text-ink text-center text-sm leading-tight">{entityB.name}</span>
                  {bet.metrics?.valueB !== undefined && (
                    <span className={`text-3xl font-bold font-tabular ${isWinningB ? 'text-forest' : 'text-ink'}`}>
                      {formatVal(valueB)}
                    </span>
                  )}
                  {isWinningB && <span className="text-xs font-semibold text-forest">Leading</span>}
                </div>
              )}
            </div>
          )}

          {/* Threshold progress */}
          {bet.type === 'PLAYER_THRESHOLD' && target && bet.metrics && (
            <div className="bg-beige rounded-xl border border-warm-border p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-ink">{bet.metrics.label}</span>
                <span className="font-tabular font-semibold text-ink">{valueA} / {target}</span>
              </div>
              <div className="h-3 bg-warm-border rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${isWinningA ? 'bg-forest' : 'bg-muted'}`}
                  style={{ width: `${Math.min(100, (valueA / target) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* The Terms */}
          <div>
            <div className="flex items-center gap-2 text-forest mb-3">
              <Scale className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">The Terms</span>
            </div>
            <div className="bg-beige rounded-xl border border-warm-border p-4">
              <p className="text-ink text-sm leading-relaxed">{bet.criteria}</p>
              {bet.metrics?.label && (
                <p className="text-xs text-muted mt-2 pt-2 border-t border-warm-border">
                  Metric: <span className="font-semibold text-ink">{bet.metrics.label}</span>
                </p>
              )}
            </div>
          </div>

          {/* Void Conditions */}
          <div>
            <div className="flex items-center gap-2 text-danger mb-3">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Void Conditions</span>
            </div>
            <div className="bg-danger-light rounded-xl border border-danger/20 p-4">
              <p className="text-danger text-sm leading-relaxed">{bet.voidConditions}</p>
            </div>
          </div>

          {/* Participants */}
          <div>
            <div className="flex items-center gap-2 text-muted mb-3">
              <Users className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Who's Betting</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-beige rounded-xl border border-warm-border p-4">
                <span className="text-xs font-semibold text-forest uppercase tracking-wider block mb-2">Side A</span>
                <p className="font-serif font-bold text-ink text-lg leading-tight">
                  {bet.entities.filter(e => e.side === 'A').map(e => e.name).join(', ')}
                </p>
                <p className="text-xs text-muted mt-1">
                  {bet.participants.filter(p => p.side === 'A').map(p => p.name).join(' & ')}
                </p>
              </div>
              <div className="bg-beige rounded-xl border border-warm-border p-4">
                <span className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">Side B</span>
                <p className="font-serif font-bold text-ink text-lg leading-tight">
                  {bet.entities.filter(e => e.side === 'B').map(e => e.name).join(', ') || 'Field'}
                </p>
                <p className="text-xs text-muted mt-1">
                  {bet.participants.filter(p => p.side === 'B').map(p => p.name).join(' & ')}
                </p>
              </div>
            </div>
          </div>

          {/* Prize */}
          <div className="flex items-start gap-4 bg-beige rounded-xl border border-warm-border p-5">
            <Trophy className="w-6 h-6 text-forest shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1">The Prize</span>
              <p className="font-serif font-bold text-ink text-xl leading-snug">{bet.prize}</p>
            </div>
          </div>

        </div>

        {/* Bottom safe area for mobile */}
        <div className="h-safe-area-inset-bottom md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
      </div>
    </div>
  );
};
