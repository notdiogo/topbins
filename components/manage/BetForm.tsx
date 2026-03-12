import React, { useState, useEffect } from 'react';
import { Bet, BetEntity, Participant, Side } from '../../types';

interface BetFormProps {
  initial: Bet | null; // null = creating a new bet
  onSave: (bet: Bet) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const SIDES: Side[] = ['A', 'B', 'NONE'];
const STATUS_OPTIONS = ['ACTIVE', 'PENDING', 'SETTLED', 'VOID'] as const;
const TYPE_OPTIONS = ['PLAYER_VS_PLAYER', 'PLAYER_THRESHOLD', 'TEAM_VS_TEAM'] as const;

function emptyBet(): Bet {
  return {
    id: '',
    slug: '',
    title: '',
    league: 'EPL',
    season: '2025-2026',
    type: 'PLAYER_VS_PLAYER',
    criteria: '',
    voidConditions: '',
    prize: '',
    status: 'ACTIVE',
    heroImage: '',
    useCustomHero: false,
    participants: [
      { name: '', side: 'A' },
      { name: '', side: 'B' },
    ],
    entities: [
      { name: '', type: 'PLAYER', side: 'A', image: '' },
      { name: '', type: 'PLAYER', side: 'B', image: '' },
    ],
    metrics: {
      label: '',
      valueA: 0,
      valueB: 0,
    },
  };
}

export const BetForm: React.FC<BetFormProps> = ({ initial, onSave, onCancel, isSaving }) => {
  const [form, setForm] = useState<Bet>(initial ?? emptyBet());
  const isNew = !initial;

  useEffect(() => {
    setForm(initial ?? emptyBet());
  }, [initial]);

  const set = <K extends keyof Bet>(key: K, value: Bet[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setMetric = (key: string, value: unknown) =>
    setForm((f) => ({ ...f, metrics: { ...(f.metrics ?? { label: '', valueA: 0 }), [key]: value } }));

  // Participants
  const setParticipant = (i: number, field: keyof Participant, value: string) =>
    setForm((f) => {
      const p = [...f.participants];
      p[i] = { ...p[i], [field]: value };
      return { ...f, participants: p };
    });

  const addParticipant = () =>
    setForm((f) => ({ ...f, participants: [...f.participants, { name: '', side: 'A' }] }));

  const removeParticipant = (i: number) =>
    setForm((f) => ({ ...f, participants: f.participants.filter((_, idx) => idx !== i) }));

  // Entities
  const setEntity = (i: number, field: keyof BetEntity, value: string) =>
    setForm((f) => {
      const e = [...f.entities];
      e[i] = { ...e[i], [field]: value };
      return { ...f, entities: e };
    });

  const addEntity = () =>
    setForm((f) => ({ ...f, entities: [...f.entities, { name: '', type: 'PLAYER', side: 'A', image: '' }] }));

  const removeEntity = (i: number) =>
    setForm((f) => ({ ...f, entities: f.entities.filter((_, idx) => idx !== i) }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const isThreshold = form.type === 'PLAYER_THRESHOLD';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Identity */}
      <section>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3 border-b border-warm-border pb-1">Identity</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Title" className="col-span-2">
            <input className={inputCls} value={form.title} onChange={(e) => set('title', e.target.value)} required />
          </Field>
          <Field label="Slug">
            <input className={inputCls} value={form.slug} onChange={(e) => set('slug', e.target.value)} required />
          </Field>
          <Field label="League">
            <input className={inputCls} value={form.league} onChange={(e) => set('league', e.target.value)} />
          </Field>
          <Field label="Season">
            <input className={inputCls} value={form.season} onChange={(e) => set('season', e.target.value)} />
          </Field>
          <Field label="Status">
            <select className={inputCls} value={form.status} onChange={(e) => set('status', e.target.value as Bet['status'])}>
              {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Type" className="col-span-2">
            <select className={inputCls} value={form.type} onChange={(e) => set('type', e.target.value as Bet['type'])}>
              {TYPE_OPTIONS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
        </div>
      </section>

      {/* Rules */}
      <section>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3 border-b border-warm-border pb-1">Rules</h3>
        <div className="space-y-3">
          <Field label="Prize">
            <input className={inputCls} value={form.prize} onChange={(e) => set('prize', e.target.value)} />
          </Field>
          <Field label="Criteria">
            <textarea className={inputCls + ' resize-none'} rows={2} value={form.criteria} onChange={(e) => set('criteria', e.target.value)} />
          </Field>
          <Field label="Void Conditions">
            <textarea className={inputCls + ' resize-none'} rows={2} value={form.voidConditions} onChange={(e) => set('voidConditions', e.target.value)} />
          </Field>
        </div>
      </section>

      {/* Stats */}
      <section>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3 border-b border-warm-border pb-1">Stats / Metrics</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Label" className="col-span-2">
            <input className={inputCls} value={form.metrics?.label ?? ''} onChange={(e) => setMetric('label', e.target.value)} />
          </Field>
          <Field label={isThreshold ? 'Current Value' : 'Value A'}>
            <input type="number" step="any" className={inputCls} value={form.metrics?.valueA ?? ''} onChange={(e) => setMetric('valueA', parseFloat(e.target.value) || 0)} />
          </Field>
          {!isThreshold && (
            <Field label="Value B">
              <input type="number" step="any" className={inputCls} value={form.metrics?.valueB ?? ''} onChange={(e) => setMetric('valueB', parseFloat(e.target.value) || 0)} />
            </Field>
          )}
          {isThreshold && (
            <Field label="Target">
              <input type="number" step="any" className={inputCls} value={form.metrics?.target ?? ''} onChange={(e) => setMetric('target', parseFloat(e.target.value) || 0)} />
            </Field>
          )}
          {!isThreshold && (
            <>
              <Field label="Max Value (optional)">
                <input type="number" step="any" className={inputCls} value={form.metrics?.maxValue ?? ''} onChange={(e) => setMetric('maxValue', e.target.value ? parseFloat(e.target.value) : undefined)} />
              </Field>
              <Field label="Inverse (lower = better)">
                <div className="flex items-center h-[34px]">
                  <input type="checkbox" checked={form.metrics?.isInverse ?? false} onChange={(e) => setMetric('isInverse', e.target.checked)} className="w-4 h-4 accent-forest" />
                </div>
              </Field>
            </>
          )}
        </div>
      </section>

      {/* Participants */}
      <section>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3 border-b border-warm-border pb-1">Participants</h3>
        <div className="space-y-2">
          {form.participants.map((p, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                className={inputCls + ' flex-1'}
                placeholder="Name"
                value={p.name}
                onChange={(e) => setParticipant(i, 'name', e.target.value)}
              />
              <select className={inputCls + ' w-20'} value={p.side} onChange={(e) => setParticipant(i, 'side', e.target.value)}>
                {SIDES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <button type="button" onClick={() => removeParticipant(i)} className="text-muted hover:text-red-600 text-lg leading-none px-1">×</button>
            </div>
          ))}
          <button type="button" onClick={addParticipant} className="text-xs text-forest hover:underline mt-1">+ Add participant</button>
        </div>
      </section>

      {/* Entities */}
      <section>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3 border-b border-warm-border pb-1">Entities (Players / Teams)</h3>
        <div className="space-y-3">
          {form.entities.map((ent, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 p-3 bg-parchment rounded border border-warm-border">
              <input className={inputCls} placeholder="Name" value={ent.name} onChange={(e) => setEntity(i, 'name', e.target.value)} />
              <select className={inputCls} value={ent.type} onChange={(e) => setEntity(i, 'type', e.target.value as BetEntity['type'])}>
                <option value="PLAYER">PLAYER</option>
                <option value="TEAM">TEAM</option>
              </select>
              <select className={inputCls} value={ent.side} onChange={(e) => setEntity(i, 'side', e.target.value)}>
                {SIDES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <input className={inputCls} placeholder="Image URL or /path" value={ent.image} onChange={(e) => setEntity(i, 'image', e.target.value)} />
              <div className="col-span-2 flex justify-end">
                <button type="button" onClick={() => removeEntity(i)} className="text-xs text-muted hover:text-red-600">Remove</button>
              </div>
            </div>
          ))}
          <button type="button" onClick={addEntity} className="text-xs text-forest hover:underline">+ Add entity</button>
        </div>
      </section>

      {/* Images */}
      <section>
        <h3 className="text-xs font-semibold text-muted uppercase tracking-widest mb-3 border-b border-warm-border pb-1">Images</h3>
        <div className="space-y-3">
          <Field label="Hero Image URL or /path">
            <input className={inputCls} value={form.heroImage} onChange={(e) => set('heroImage', e.target.value)} />
          </Field>
          <Field label="Use Custom Hero">
            <div className="flex items-center h-[34px]">
              <input type="checkbox" checked={form.useCustomHero ?? false} onChange={(e) => set('useCustomHero', e.target.checked)} className="w-4 h-4 accent-forest" />
            </div>
          </Field>
        </div>
      </section>

      {/* Actions */}
      <div className="flex gap-3 pt-2 border-t border-warm-border">
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 bg-forest text-parchment text-sm font-semibold py-2 rounded hover:bg-forest/90 transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Saving…' : isNew ? 'Create bet' : 'Save changes'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 text-sm text-muted hover:text-ink border border-warm-border rounded transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

// ── small helpers ─────────────────────────────────────────────

const inputCls = 'w-full bg-parchment border border-warm-border rounded px-3 py-1.5 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-forest/50';

const Field: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className = '' }) => (
  <div className={className}>
    <label className="block text-xs font-medium text-muted mb-1">{label}</label>
    {children}
  </div>
);
