import React, { useEffect, useState } from 'react';
import { PredictionCategory, PredictionStatus } from '../../types';

const PEOPLE = ['Diogo', 'Mitch', 'Shiv'];
const STATUS_OPTIONS: PredictionStatus[] = ['OPEN', 'SETTLED', 'VOID'];

interface PredictionFormProps {
  initial: PredictionCategory | null;
  onSave: (cat: PredictionCategory) => void;
  onCancel: () => void;
  isSaving: boolean;
}

function emptyPrediction(): PredictionCategory {
  return {
    id: '',
    groupSlug: 'world-cup-2026',
    name: '',
    details: '',
    order: 99,
    picks: { Diogo: '', Mitch: '', Shiv: '' },
    status: 'OPEN',
  };
}

const inputCls = 'w-full bg-parchment border border-warm-border rounded px-3 py-1.5 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-forest/50';

const Field: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className = '' }) => (
  <div className={className}>
    <label className="block text-xs font-medium text-muted mb-1">{label}</label>
    {children}
  </div>
);

export const PredictionForm: React.FC<PredictionFormProps> = ({ initial, onSave, onCancel, isSaving }) => {
  const [form, setForm] = useState<PredictionCategory>(initial ?? emptyPrediction());
  const isNew = !initial;

  useEffect(() => { setForm(initial ?? emptyPrediction()); }, [initial]);

  const set = <K extends keyof PredictionCategory>(key: K, value: PredictionCategory[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setPick = (name: string, value: string) =>
    setForm((f) => ({ ...f, picks: { ...f.picks, [name]: value } }));

  const isSettled = form.status === 'SETTLED';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Category name" className="col-span-2">
          <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="Golden Boot" />
        </Field>
        <Field label="Details (tooltip)" className="col-span-2">
          <textarea className={inputCls + ' resize-none'} rows={2} value={form.details} onChange={(e) => set('details', e.target.value)} placeholder="Top goalscorer across the tournament." />
        </Field>
        <Field label="Order">
          <input type="number" className={inputCls} value={form.order} onChange={(e) => set('order', parseInt(e.target.value) || 0)} />
        </Field>
        <Field label="Status">
          <select className={inputCls} value={form.status} onChange={(e) => set('status', e.target.value as PredictionStatus)}>
            {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-muted uppercase tracking-widest mb-2 border-b border-warm-border pb-1">Picks</h4>
        <div className="grid grid-cols-1 gap-2">
          {PEOPLE.map((name) => (
            <Field key={name} label={name}>
              <input className={inputCls} value={form.picks[name] ?? ''} onChange={(e) => setPick(name, e.target.value)} placeholder={`${name}'s prediction`} />
            </Field>
          ))}
        </div>
      </div>

      {isSettled && (
        <Field label="Correct answer (awards 1 point to each exact match)">
          <input className={inputCls} value={form.correctAnswer ?? ''} onChange={(e) => set('correctAnswer', e.target.value || undefined)} placeholder="Kylian Mbappé" />
        </Field>
      )}

      <div className="flex gap-3 pt-2 border-t border-warm-border">
        <button type="submit" disabled={isSaving} className="flex-1 bg-forest text-parchment text-sm font-semibold py-2 rounded hover:bg-forest/90 transition-colors disabled:opacity-50">
          {isSaving ? 'Saving…' : isNew ? 'Create category' : 'Save changes'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 text-sm text-muted hover:text-ink border border-warm-border rounded transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
};
