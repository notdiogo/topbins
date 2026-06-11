import React, { useState } from 'react';
import { Bet, PredictionCategory } from '../../types';
import { BetForm } from './BetForm';
import { PredictionForm } from './PredictionForm';
import { BracketAdmin } from './BracketAdmin';
import { updateBet, createBet, updatePrediction, createPrediction } from '../../services/supabaseService';

const STATUS_BADGE: Record<string, string> = {
  ACTIVE:  'bg-forest/10 text-forest',
  PENDING: 'bg-amber-100 text-amber-700',
  SETTLED: 'bg-beige text-muted',
  VOID:    'bg-red-50 text-red-500',
  OPEN:    'bg-forest/10 text-forest',
};

interface ManagePageProps {
  bets: Bet[];
  onBetsChange: (bets: Bet[]) => void;
  predictions: PredictionCategory[];
  onPredictionsChange: (p: PredictionCategory[]) => void;
}

type Tab = 'bets' | 'predictions' | 'brackets';

export const ManagePage: React.FC<ManagePageProps> = ({ bets, onBetsChange, predictions, onPredictionsChange }) => {
  const [tab, setTab] = useState<Tab>('bets');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-ink">Manage</h1>
        <p className="text-muted text-sm mt-0.5">Changes go live immediately.</p>
      </div>

      <div className="inline-flex items-center gap-1 bg-beige border border-warm-border rounded-full p-1 mb-6">
        {(['bets', 'predictions', 'brackets'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-sm font-semibold px-4 py-1.5 rounded-full capitalize transition-colors ${
              tab === t ? 'bg-forest text-stone' : 'text-muted hover:text-ink'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'bets' && <BetsPanel bets={bets} onBetsChange={onBetsChange} />}
      {tab === 'predictions' && <PredictionsPanel predictions={predictions} onPredictionsChange={onPredictionsChange} />}
      {tab === 'brackets' && <BracketAdmin />}
    </div>
  );
};

// ── Bets ──────────────────────────────────────────────────────────
const BetsPanel: React.FC<{ bets: Bet[]; onBetsChange: (b: Bet[]) => void }> = ({ bets, onBetsChange }) => {
  const [selected, setSelected] = useState<Bet | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const openEdit = (bet: Bet) => { setIsNew(false); setSelected(bet); setSaveError(null); };
  const openNew  = () => { setIsNew(true); setSelected(null); setSaveError(null); };
  const closeForm = () => { setSelected(null); setIsNew(false); setSaveError(null); };

  const handleSave = async (bet: Bet) => {
    setSaveError(null); setIsSaving(true);
    try {
      if (isNew) {
        const { id: _id, ...fields } = bet;
        const created = await createBet(fields);
        onBetsChange([...bets, created]);
      } else {
        const { id, ...fields } = bet;
        await updateBet(id, fields);
        onBetsChange(bets.map((b) => (b.id === id ? bet : b)));
      }
      closeForm();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSaving(false);
    }
  };

  const showForm = isNew || selected !== null;

  return (
    <>
      <div className="flex justify-end mb-3">
        <button onClick={openNew} className="bg-forest text-stone text-sm font-semibold px-4 py-2 rounded-lg hover:bg-forest-mid transition-colors">+ New bet</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-2">
          {bets.map((bet) => (
            <button
              key={bet.id}
              onClick={() => openEdit(bet)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                selected?.id === bet.id ? 'bg-beige border-forest/40 ring-1 ring-forest/20' : 'bg-stone border-warm-border hover:border-forest/30'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-sm text-ink truncate">{bet.title}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATUS_BADGE[bet.status] ?? 'bg-beige text-muted'}`}>{bet.status}</span>
              </div>
              <div className="text-xs text-muted mt-0.5">{bet.group.name} · {bet.league}</div>
            </button>
          ))}
          {bets.length === 0 && <p className="text-muted text-sm text-center py-8">No bets yet. Create one!</p>}
        </div>

        {showForm ? (
          <div className="bg-beige border border-warm-border rounded-xl p-6">
            <h2 className="font-display font-bold text-lg text-ink mb-5">{isNew ? 'New bet' : `Edit: ${selected?.title}`}</h2>
            {saveError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">{saveError}</p>}
            <BetForm initial={isNew ? null : selected} onSave={handleSave} onCancel={closeForm} isSaving={isSaving} />
          </div>
        ) : (
          <div className="hidden lg:flex items-center justify-center h-48 border border-dashed border-warm-border rounded-xl">
            <p className="text-muted text-sm">Select a bet to edit, or create a new one.</p>
          </div>
        )}
      </div>
    </>
  );
};

// ── Predictions ───────────────────────────────────────────────────
const PredictionsPanel: React.FC<{ predictions: PredictionCategory[]; onPredictionsChange: (p: PredictionCategory[]) => void }> = ({ predictions, onPredictionsChange }) => {
  const [selected, setSelected] = useState<PredictionCategory | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const openEdit = (cat: PredictionCategory) => { setIsNew(false); setSelected(cat); setSaveError(null); };
  const openNew  = () => { setIsNew(true); setSelected(null); setSaveError(null); };
  const closeForm = () => { setSelected(null); setIsNew(false); setSaveError(null); };

  const handleSave = async (cat: PredictionCategory) => {
    setSaveError(null); setIsSaving(true);
    try {
      if (isNew) {
        const { id: _id, ...fields } = cat;
        const created = await createPrediction(fields);
        onPredictionsChange([...predictions, created]);
      } else {
        const { id, ...fields } = cat;
        await updatePrediction(id, fields);
        onPredictionsChange(predictions.map((p) => (p.id === id ? cat : p)));
      }
      closeForm();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSaving(false);
    }
  };

  const showForm = isNew || selected !== null;
  const sorted = [...predictions].sort((a, b) => a.order - b.order);

  return (
    <>
      <div className="flex justify-end mb-3">
        <button onClick={openNew} className="bg-forest text-stone text-sm font-semibold px-4 py-2 rounded-lg hover:bg-forest-mid transition-colors">+ New category</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-2">
          {sorted.map((cat) => (
            <button
              key={cat.id}
              onClick={() => openEdit(cat)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                selected?.id === cat.id ? 'bg-beige border-forest/40 ring-1 ring-forest/20' : 'bg-stone border-warm-border hover:border-forest/30'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-sm text-ink truncate">{cat.name}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATUS_BADGE[cat.status] ?? 'bg-beige text-muted'}`}>{cat.status}</span>
              </div>
              <div className="text-xs text-muted mt-0.5 truncate">{cat.details || 'No details'}</div>
            </button>
          ))}
          {predictions.length === 0 && <p className="text-muted text-sm text-center py-8">No categories yet. Create one!</p>}
        </div>

        {showForm ? (
          <div className="bg-beige border border-warm-border rounded-xl p-6">
            <h2 className="font-display font-bold text-lg text-ink mb-5">{isNew ? 'New category' : `Edit: ${selected?.name}`}</h2>
            {saveError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">{saveError}</p>}
            <PredictionForm initial={isNew ? null : selected} onSave={handleSave} onCancel={closeForm} isSaving={isSaving} />
          </div>
        ) : (
          <div className="hidden lg:flex items-center justify-center h-48 border border-dashed border-warm-border rounded-xl">
            <p className="text-muted text-sm">Select a category to edit, or create a new one.</p>
          </div>
        )}
      </div>
    </>
  );
};
