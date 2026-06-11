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
  const peopleOrder = ['Diogo', 'Mitch', 'Shiv'];
  const people = entries.map((e) => e.participant).sort((a, b) => peopleOrder.indexOf(a) - peopleOrder.indexOf(b));
  const [person, setPerson] = useState(people[0] ?? 'Diogo');
  const [stage, setStage] = useState<'group' | 'knockout'>('group');

  const teamById = useMemo(() => {
    const m = new Map<string, WCTeam>();
    teams.forEach((t) => m.set(t.id, t));
    return m;
  }, [teams]);
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
        <div key={grp} className="rounded-2xl bg-stone p-4 shadow-lg shadow-ink/5 ring-1 ring-warm-border/40">
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

// ── Bracket connector SVG ─────────────────────────────────────────
const FIRST_ROUND_MATCHES = 16; // R32
const SLOT_H = 72;              // px per R32 slot; total body height = FIRST_ROUND_MATCHES * SLOT_H
const BODY_H = FIRST_ROUND_MATCHES * SLOT_H;
const COL_W = 160;
const CONN_W = 24;

const BracketConnector: React.FC<{ fromCount: number }> = ({ fromCount }) => {
  const matchH = BODY_H / fromCount; // height each "from" match occupies
  return (
    <svg
      width={CONN_W}
      height={BODY_H}
      className="shrink-0"
      style={{ color: 'rgb(var(--border))' }}
    >
      {Array.from({ length: fromCount / 2 }).map((_, i) => {
        const topY = i * 2 * matchH + matchH / 2;
        const botY = (i * 2 + 1) * matchH + matchH / 2;
        const midY = (topY + botY) / 2;
        const mx = CONN_W / 2;
        return (
          <g key={i} stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round">
            <polyline points={`0,${topY} ${mx},${topY} ${mx},${botY} 0,${botY}`} />
            <line x1={mx} y1={midY} x2={CONN_W} y2={midY} />
          </g>
        );
      })}
    </svg>
  );
};

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
      {/* Round headers */}
      <div className="mb-2 flex min-w-max">
        {rounds.map((roundId, ri) => (
          <React.Fragment key={roundId}>
            {ri > 0 && <div style={{ width: CONN_W }} />}
            <div style={{ width: COL_W }} className="text-center text-xs font-semibold uppercase tracking-wide text-muted">
              {ROUNDS.find((r) => r.id === roundId)!.short}
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Bracket body */}
      <div className="flex min-w-max" style={{ height: BODY_H }}>
        {rounds.map((roundId, ri) => {
          const matches = MATCHES_BY_ROUND[roundId];
          const matchH = BODY_H / matches.length;

          return (
            <React.Fragment key={roundId}>
              {ri > 0 && <BracketConnector fromCount={MATCHES_BY_ROUND[rounds[ri - 1]].length} />}
              <div style={{ width: COL_W, height: BODY_H }} className="relative shrink-0">
                {matches.map((m, mi) => {
                  const aId = resolveTeam(m.a, entry.groupOrders, entry.knockout);
                  const bId = resolveTeam(m.b, entry.groupOrders, entry.knockout);
                  const picked = entry.knockout[m.id];
                  const actualWinner = actual.knockout[m.id];
                  const cardH = 68;
                  const top = mi * matchH + (matchH - cardH) / 2;

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
                    <div
                      key={m.id}
                      style={{ position: 'absolute', top, left: 4, right: 4, height: cardH }}
                      className="rounded-lg bg-stone p-1.5 shadow-sm ring-1 ring-warm-border/40"
                    >
                      <Row id={aId} src={m.a} />
                      <div className="my-0.5 border-t border-warm-border/60" />
                      <Row id={bId} src={m.b} />
                    </div>
                  );
                })}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
