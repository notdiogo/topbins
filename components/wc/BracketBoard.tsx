import React, { useMemo, useState } from 'react';
import { WCTeam, BracketEntry, BracketActual } from '../../types';
import { GROUPS, MATCHES_BY_ROUND, ROUNDS, resolveTeam, sourceLabel, KnockoutRound } from '../../lib/wcBracket';
import { bracketPoints } from '../../lib/scoring';
import { Check } from 'lucide-react';
import { formatCountryWithEmoji } from '../../lib/countryEmoji';

const PERSON_VAR: Record<string, string> = { Diogo: '--p-diogo', Mitch: '--p-mitch', Shiv: '--p-shiv' };
const personColor = (name: string) => `rgb(var(${PERSON_VAR[name] ?? '--accent'}))`;

interface Props {
  entries: BracketEntry[];
  actual: BracketActual;
  teams: WCTeam[];
}

export const BracketBoard: React.FC<Props> = ({ entries, actual, teams }) => {
  const people = entries.map((e) => e.participant);
  const [person, setPerson] = useState(people[0] ?? 'Diogo');
  const [stage, setStage] = useState<'group' | 'knockout'>('group');

  const teamById = useMemo(() => {
    const m = new Map<string, WCTeam>();
    teams.forEach((t) => m.set(t.id, t));
    return m;
  }, [teams]);
  const label = (id?: string) => (id ? teamById.get(id)?.code ?? id.toUpperCase() : '');
  const fullName = (id?: string) => (id ? teamById.get(id)?.name ?? id : '');

  const entry = entries.find((e) => e.participant === person);
  const points = useMemo(() => bracketPoints(entries, actual), [entries, actual]);

  if (!entry) {
    return (
      <div className="rounded-2xl border border-dashed border-warm-border bg-stone p-10 text-center">
        <p className="text-sm text-muted">No bracket entries yet. Add them from the admin page.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Controls */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center gap-1 self-start rounded-full border border-warm-border bg-stone p-1">
          {people.map((p) => {
            const active = p === person;
            return (
              <button
                key={p}
                onClick={() => setPerson(p)}
                className="rounded-full px-4 py-1.5 text-sm font-semibold transition-colors"
                style={active ? { backgroundColor: personColor(p), color: '#fff' } : { color: 'rgb(var(--muted))' }}
              >
                {p} · {points[p] ?? 0}
              </button>
            );
          })}
        </div>
        <div className="inline-flex items-center gap-1 self-start rounded-full border border-warm-border bg-stone p-1">
          {(['group', 'knockout'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStage(s)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${
                stage === s ? 'bg-forest text-stone' : 'text-muted hover:text-ink'
              }`}
            >
              {s === 'group' ? 'Group stage' : 'Knockout'}
            </button>
          ))}
        </div>
      </div>

      {stage === 'group' ? (
        <GroupStage entry={entry} actual={actual} label={fullName} />
      ) : (
        <Knockout entry={entry} actual={actual} label={fullName} sourceName={sourceLabel} />
      )}
    </div>
  );
};

// ── Group stage ───────────────────────────────────────────────────
const GroupStage: React.FC<{
  entry: BracketEntry;
  actual: BracketActual;
  label: (id?: string) => string;
}> = ({ entry, actual, label }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {GROUPS.map((grp) => {
      const order = entry.groupOrders[grp] ?? [];
      const actualTop2 = new Set((actual.groupOrders[grp] ?? []).slice(0, 2));
      return (
        <div key={grp} className="rounded-2xl border border-warm-border bg-stone p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-forest-light font-display text-sm font-bold text-forest">{grp}</span>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Group {grp}</span>
          </div>
          <ol className="space-y-1.5">
            {order.map((id, i) => {
              const correctQualifier = i < 2 && actualTop2.has(id);
              const qualifierSlot = i < 2;
              return (
                <li
                  key={id}
                  className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${
                    correctQualifier ? 'bg-forest-light text-forest' : qualifierSlot ? 'bg-beige/60 text-ink' : 'text-muted'
                  }`}
                >
                  <span className="font-mono text-xs tabular-nums opacity-70">{i + 1}</span>
                  <span className={qualifierSlot ? 'font-semibold' : ''}>{formatCountryWithEmoji(label(id))}</span>
                  {correctQualifier && <Check className="ml-auto h-3.5 w-3.5" />}
                </li>
              );
            })}
          </ol>
        </div>
      );
    })}
  </div>
);

// ── Knockout ──────────────────────────────────────────────────────
const Knockout: React.FC<{
  entry: BracketEntry;
  actual: BracketActual;
  label: (id?: string) => string;
  sourceName: (s: any) => string;
}> = ({ entry, actual, label, sourceName }) => {
  const rounds = ROUNDS.map((r) => r.id) as KnockoutRound[];

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max gap-4">
        {rounds.map((roundId) => {
          const round = ROUNDS.find((r) => r.id === roundId)!;
          const matches = MATCHES_BY_ROUND[roundId];
          return (
            <div key={roundId} className="flex w-44 shrink-0 flex-col gap-3">
              <div className="text-center text-xs font-semibold uppercase tracking-wide text-muted">{round.short}</div>
              <div className="flex flex-1 flex-col justify-around gap-3">
                {matches.map((m) => {
                  const aId = resolveTeam(m.a, entry.groupOrders, entry.knockout);
                  const bId = resolveTeam(m.b, entry.groupOrders, entry.knockout);
                  const picked = entry.knockout[m.id];
                  const actualWinner = actual.knockout[m.id];
                  const Row: React.FC<{ id?: string; src: any }> = ({ id, src }) => {
                    const isPick = !!picked && id === picked;
                    const correct = isPick && !!actualWinner && actualWinner === picked;
                    const wrong = isPick && !!actualWinner && actualWinner !== picked;
                    return (
                      <div
                        className={`flex items-center justify-between rounded-md px-2 py-1 text-sm ${
                          correct ? 'bg-forest-light font-semibold text-forest'
                          : wrong ? 'text-muted line-through'
                          : isPick ? 'bg-beige font-semibold text-ink' : 'text-muted'
                        }`}
                      >
                        <span>{id ? formatCountryWithEmoji(label(id)) : sourceName(src)}</span>
                        {correct && <Check className="h-3 w-3" />}
                      </div>
                    );
                  };
                  return (
                    <div key={m.id} className="rounded-lg border border-warm-border bg-stone p-1.5">
                      <Row id={aId} src={m.a} />
                      <div className="my-0.5 border-t border-warm-border/60" />
                      <Row id={bId} src={m.b} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
