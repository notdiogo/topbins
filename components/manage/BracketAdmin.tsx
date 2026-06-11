import React, { useEffect, useState } from 'react';
import { useData } from '../../context/DataContext';
import { BracketActual, BracketEntry, WCTeam } from '../../types';
import { GROUPS, MATCHES_BY_ROUND, ROUNDS, resolveTeam, sourceLabel, KnockoutRound } from '../../lib/wcBracket';
import { saveBracketEntry, saveBracketActual, saveTeam } from '../../services/supabaseService';
import { ChevronUp, ChevronDown } from 'lucide-react';

type Target = 'actual' | string; // 'actual' or a participant name
type Mode = Target | 'teams';

export const BracketAdmin: React.FC = () => {
  const { teams, setTeams, bracketEntries, setBracketEntries, bracketActual, setBracketActual } = useData();
  const people = bracketEntries.map((e) => e.participant);

  const [mode, setMode] = useState<Mode>('actual');
  const [stage, setStage] = useState<'group' | 'knockout'>('group');
  const [draft, setDraft] = useState<{ groupOrders: Record<string, string[]>; knockout: Record<string, string> }>({ groupOrders: {}, knockout: {} });
  const [teamDraft, setTeamDraft] = useState<WCTeam[]>(teams);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Load the draft whenever the edit target changes.
  useEffect(() => {
    if (mode === 'teams') { setTeamDraft(teams); return; }
    const src = mode === 'actual'
      ? bracketActual
      : bracketEntries.find((e) => e.participant === mode);
    setDraft({
      groupOrders: JSON.parse(JSON.stringify(src?.groupOrders ?? {})),
      knockout: JSON.parse(JSON.stringify(src?.knockout ?? {})),
    });
    setMsg(null);
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const teamById = new Map(teams.map((t) => [t.id, t]));
  const label = (id?: string) => (id ? teamById.get(id)?.name ?? id : '');

  const moveTeam = (grp: string, idx: number, dir: -1 | 1) => {
    setDraft((d) => {
      const order = [...(d.groupOrders[grp] ?? [])];
      const j = idx + dir;
      if (j < 0 || j >= order.length) return d;
      [order[idx], order[j]] = [order[j], order[idx]];
      return { ...d, groupOrders: { ...d.groupOrders, [grp]: order } };
    });
  };

  const pickWinner = (matchId: string, teamId: string) =>
    setDraft((d) => ({ ...d, knockout: { ...d.knockout, [matchId]: teamId } }));

  const saveBracket = async () => {
    setSaving(true); setMsg(null);
    try {
      if (mode === 'actual') {
        const next: BracketActual = { groupOrders: draft.groupOrders, knockout: draft.knockout };
        await saveBracketActual(next);
        setBracketActual(next);
      } else {
        const existing = bracketEntries.find((e) => e.participant === mode);
        const next: BracketEntry = {
          id: existing?.id ?? `be_${(mode as string).toLowerCase()}`,
          participant: mode as string,
          groupOrders: draft.groupOrders,
          knockout: draft.knockout,
        };
        await saveBracketEntry(next);
        setBracketEntries((prev) => {
          const i = prev.findIndex((e) => e.participant === mode);
          if (i === -1) return [...prev, next];
          const copy = [...prev]; copy[i] = next; return copy;
        });
      }
      setMsg('Saved.');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Save failed (Supabase not configured?).');
    } finally { setSaving(false); }
  };

  const saveTeams = async () => {
    setSaving(true); setMsg(null);
    try {
      for (const t of teamDraft) await saveTeam(t);
      setTeams(teamDraft);
      setMsg('Teams saved.');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Save failed (Supabase not configured?).');
    } finally { setSaving(false); }
  };

  return (
    <div>
      {/* Target selector */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(['actual', ...people, 'teams'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold capitalize transition-colors ${
              mode === m ? 'bg-forest text-stone' : 'bg-beige text-muted hover:text-ink'
            }`}
          >
            {m === 'actual' ? 'Actual results' : m === 'teams' ? 'Teams' : m}
          </button>
        ))}
      </div>

      {msg && <p className="mb-3 text-sm text-forest">{msg}</p>}

      {mode === 'teams' ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GROUPS.map((grp) => (
              <div key={grp} className="rounded-xl border border-warm-border bg-stone p-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Group {grp}</div>
                {teamDraft.filter((t) => t.group === grp).map((t) => (
                  <div key={t.id} className="mb-1.5 flex gap-1.5">
                    <input
                      className="flex-1 rounded border border-warm-border bg-parchment px-2 py-1 text-sm text-ink"
                      value={t.name}
                      onChange={(e) => setTeamDraft((d) => d.map((x) => (x.id === t.id ? { ...x, name: e.target.value } : x)))}
                    />
                    <input
                      className="w-16 rounded border border-warm-border bg-parchment px-2 py-1 text-sm uppercase text-ink"
                      value={t.code}
                      onChange={(e) => setTeamDraft((d) => d.map((x) => (x.id === t.id ? { ...x, code: e.target.value } : x)))}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
          <SaveBar saving={saving} onSave={saveTeams} label="Save teams" />
        </>
      ) : (
        <>
          <div className="mb-4 inline-flex items-center gap-1 rounded-full border border-warm-border bg-stone p-1">
            {(['group', 'knockout'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStage(s)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${stage === s ? 'bg-forest text-stone' : 'text-muted hover:text-ink'}`}
              >
                {s === 'group' ? 'Group stage' : 'Knockout'}
              </button>
            ))}
          </div>

          {stage === 'group' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {GROUPS.map((grp) => (
                <div key={grp} className="rounded-xl border border-warm-border bg-stone p-3">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Group {grp}</div>
                  <ol className="space-y-1">
                    {(draft.groupOrders[grp] ?? []).map((id, i) => (
                      <li key={id} className={`flex items-center gap-2 rounded px-2 py-1 text-sm ${i < 2 ? 'bg-forest-light text-forest' : 'text-ink'}`}>
                        <span className="font-mono text-xs opacity-70">{i + 1}</span>
                        <span className="flex-1">{label(id)}</span>
                        <button onClick={() => moveTeam(grp, i, -1)} className="text-muted hover:text-ink"><ChevronUp className="h-4 w-4" /></button>
                        <button onClick={() => moveTeam(grp, i, 1)} className="text-muted hover:text-ink"><ChevronDown className="h-4 w-4" /></button>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto pb-2">
              <div className="flex min-w-max gap-4">
                {(ROUNDS.map((r) => r.id) as KnockoutRound[]).map((roundId) => (
                  <div key={roundId} className="flex w-48 shrink-0 flex-col gap-3">
                    <div className="text-center text-xs font-semibold uppercase tracking-wide text-muted">
                      {ROUNDS.find((r) => r.id === roundId)!.short}
                    </div>
                    {MATCHES_BY_ROUND[roundId].map((m) => {
                      const aId = resolveTeam(m.a, draft.groupOrders, draft.knockout);
                      const bId = resolveTeam(m.b, draft.groupOrders, draft.knockout);
                      const picked = draft.knockout[m.id];
                      const Btn: React.FC<{ id?: string; src: any }> = ({ id, src }) => (
                        <button
                          disabled={!id}
                          onClick={() => id && pickWinner(m.id, id)}
                          className={`block w-full rounded px-2 py-1 text-left text-sm transition-colors ${
                            id && id === picked ? 'bg-forest text-stone font-semibold' : id ? 'bg-beige text-ink hover:bg-forest-light' : 'text-muted'
                          }`}
                        >
                          {id ? label(id) : sourceLabel(src)}
                        </button>
                      );
                      return (
                        <div key={m.id} className="space-y-1 rounded-lg border border-warm-border bg-stone p-1.5">
                          <Btn id={aId} src={m.a} />
                          <Btn id={bId} src={m.b} />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
          <SaveBar saving={saving} onSave={saveBracket} label={`Save ${mode === 'actual' ? 'results' : mode}`} />
        </>
      )}
    </div>
  );
};

const SaveBar: React.FC<{ saving: boolean; onSave: () => void; label: string }> = ({ saving, onSave, label }) => (
  <div className="mt-5 border-t border-warm-border pt-4">
    <button onClick={onSave} disabled={saving} className="rounded-lg bg-forest px-5 py-2 text-sm font-semibold text-stone hover:bg-forest-mid disabled:opacity-50">
      {saving ? 'Saving…' : label}
    </button>
  </div>
);
