import React from 'react';
import { PredictionCategory } from '../../types';
import { predictionPoints } from '../../lib/scoring';
import { Info, Check } from 'lucide-react';

const PEOPLE = [
  { name: 'Diogo', varName: '--p-diogo' },
  { name: 'Mitch', varName: '--p-mitch' },
  { name: 'Shiv', varName: '--p-shiv' },
];
const personColor = (v: string) => `rgb(var(${v}))`;

const norm = (s?: string) => (s ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
const isCorrect = (cat: PredictionCategory, name: string) =>
  cat.status === 'SETTLED' && !!cat.correctAnswer && norm(cat.picks[name]) === norm(cat.correctAnswer);

const CategoryLabel: React.FC<{ cat: PredictionCategory }> = ({ cat }) => (
  <div className="flex items-center gap-1.5">
    <span className="font-semibold text-ink">{cat.name}</span>
    {cat.details && (
      <span className="group relative inline-flex">
        <Info className="h-3.5 w-3.5 text-muted" />
        <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 w-52 -translate-x-1/2 rounded-lg border border-warm-border bg-ink px-3 py-2 text-xs leading-snug text-stone opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          {cat.details}
        </span>
      </span>
    )}
    {cat.status === 'SETTLED' && cat.correctAnswer && (
      <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-forest-light px-2 py-0.5 text-[11px] font-semibold text-forest">
        <Check className="h-3 w-3" /> {cat.correctAnswer}
      </span>
    )}
  </div>
);

const Pick: React.FC<{ cat: PredictionCategory; name: string }> = ({ cat, name }) => {
  const pick = cat.picks[name];
  const correct = isCorrect(cat, name);
  if (!pick) return <span className="text-muted">·</span>;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm ${
        correct ? 'bg-forest-light font-semibold text-forest' : 'text-ink'
      }`}
    >
      {correct && <Check className="h-3.5 w-3.5" />}
      {pick}
    </span>
  );
};

export const PredictionsTable: React.FC<{ predictions: PredictionCategory[] }> = ({ predictions }) => {
  const cats = [...predictions].sort((a, b) => a.order - b.order);
  const points = predictionPoints(cats);

  if (cats.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-warm-border bg-stone p-10 text-center">
        <p className="text-sm text-muted">No prediction categories yet. Add them from the admin page.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-warm-border bg-stone">
      {/* Desktop / tablet table */}
      <table className="hidden w-full border-collapse sm:table">
        <thead>
          <tr className="border-b border-warm-border bg-beige/60">
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Category</th>
            {PEOPLE.map((p) => (
              <th key={p.name} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: personColor(p.varName) }}>
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cats.map((cat) => (
            <tr key={cat.id} className="border-b border-warm-border/70 last:border-0">
              <td className="px-5 py-3 align-middle"><CategoryLabel cat={cat} /></td>
              {PEOPLE.map((p) => (
                <td key={p.name} className="px-5 py-3 align-middle"><Pick cat={cat} name={p.name} /></td>
              ))}
            </tr>
          ))}
          <tr className="bg-beige/60">
            <td className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Points</td>
            {PEOPLE.map((p) => (
              <td key={p.name} className="px-5 py-3 font-mono text-lg font-bold tabular-nums" style={{ color: personColor(p.varName) }}>
                {points[p.name] ?? 0}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      {/* Mobile: one card per category */}
      <div className="divide-y divide-warm-border sm:hidden">
        {cats.map((cat) => (
          <div key={cat.id} className="p-4">
            <CategoryLabel cat={cat} />
            <div className="mt-3 grid grid-cols-3 gap-2">
              {PEOPLE.map((p) => (
                <div key={p.name}>
                  <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: personColor(p.varName) }}>{p.name}</div>
                  <div className="mt-0.5"><Pick cat={cat} name={p.name} /></div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between bg-beige/60 px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Points</span>
          <div className="flex gap-4">
            {PEOPLE.map((p) => (
              <span key={p.name} className="font-mono text-base font-bold tabular-nums" style={{ color: personColor(p.varName) }}>
                {p.name[0]} {points[p.name] ?? 0}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
