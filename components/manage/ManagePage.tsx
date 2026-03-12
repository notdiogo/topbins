import React, { useState } from 'react';
import { Bet } from '../../types';
import { BetForm } from './BetForm';
import { updateBet, createBet } from '../../services/supabaseService';

const STATUS_BADGE: Record<string, string> = {
  ACTIVE:  'bg-forest/10 text-forest',
  PENDING: 'bg-amber-100 text-amber-700',
  SETTLED: 'bg-beige text-muted',
  VOID:    'bg-red-50 text-red-500',
};

interface ManagePageProps {
  bets: Bet[];
  onBetsChange: (bets: Bet[]) => void;
}

export const ManagePage: React.FC<ManagePageProps> = ({ bets, onBetsChange }) => {
  const [selected, setSelected] = useState<Bet | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const openEdit = (bet: Bet) => { setIsNew(false); setSelected(bet); setSaveError(null); };
  const openNew  = () => { setIsNew(true); setSelected(null); setSaveError(null); };
  const closeForm = () => { setSelected(null); setIsNew(false); setSaveError(null); };

  const handleSave = async (bet: Bet) => {
    setSaveError(null);
    setIsSaving(true);
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif font-bold text-2xl text-ink">Manage Bets</h1>
          <p className="text-muted text-sm mt-0.5">Changes go live immediately.</p>
        </div>
        <button
          onClick={openNew}
          className="bg-forest text-parchment text-sm font-semibold px-4 py-2 rounded hover:bg-forest/90 transition-colors"
        >
          + New bet
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-2">
          {bets.map((bet) => (
            <button
              key={bet.id}
              onClick={() => openEdit(bet)}
              className={`w-full text-left px-4 py-3 rounded border transition-colors ${
                selected?.id === bet.id
                  ? 'bg-beige border-forest/40 ring-1 ring-forest/20'
                  : 'bg-beige border-warm-border hover:border-forest/30'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-sm text-ink truncate">{bet.title}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATUS_BADGE[bet.status] ?? 'bg-beige text-muted'}`}>
                  {bet.status}
                </span>
              </div>
              <div className="text-xs text-muted mt-0.5">{bet.league} · {bet.season}</div>
            </button>
          ))}
          {bets.length === 0 && (
            <p className="text-muted text-sm text-center py-8">No bets yet. Create one!</p>
          )}
        </div>

        {showForm ? (
          <div className="bg-beige border border-warm-border rounded-lg p-6">
            <h2 className="font-serif font-bold text-lg text-ink mb-5">
              {isNew ? 'New bet' : `Edit: ${selected?.title}`}
            </h2>
            {saveError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">
                {saveError}
              </p>
            )}
            <BetForm
              initial={isNew ? null : selected}
              onSave={handleSave}
              onCancel={closeForm}
              isSaving={isSaving}
            />
          </div>
        ) : (
          <div className="hidden lg:flex items-center justify-center h-48 border border-dashed border-warm-border rounded-lg">
            <p className="text-muted text-sm">Select a bet to edit, or create a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
};
