import React from 'react';
import { AdminGate } from '../components/AdminGate';
import { useData } from '../context/DataContext';

export const AdminPage: React.FC = () => {
  const { bets, setBets, predictions, setPredictions } = useData();
  return (
    <div className="bg-parchment min-h-[100dvh] text-ink">
      <AdminGate
        bets={bets}
        onBetsChange={setBets}
        predictions={predictions}
        onPredictionsChange={setPredictions}
      />
    </div>
  );
};
