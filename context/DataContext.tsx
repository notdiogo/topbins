import React, { createContext, useContext, useEffect, useState } from 'react';
import { Bet, MonthlyStanding } from '../types';
import { MOCK_BETS, LEAGUE_HISTORY, LAST_UPDATED } from '../constants';
import { fetchBets, fetchLeagueHistory, fetchLastUpdated } from '../services/supabaseService';

interface DataContextValue {
  bets: Bet[];
  setBets: React.Dispatch<React.SetStateAction<Bet[]>>;
  leagueHistory: MonthlyStanding[];
  lastUpdated: string;
}

const DataContext = createContext<DataContextValue | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bets, setBets] = useState<Bet[]>(MOCK_BETS);
  const [leagueHistory, setLeagueHistory] = useState<MonthlyStanding[]>(LEAGUE_HISTORY);
  const [lastUpdated, setLastUpdated] = useState(LAST_UPDATED);

  useEffect(() => {
    fetchBets().then((data) => { if (data.length > 0) setBets(data); });
    fetchLeagueHistory().then((data) => { if (data.length > 0) setLeagueHistory(data); });
    fetchLastUpdated().then((val) => { if (val) setLastUpdated(val); });
  }, []);

  return (
    <DataContext.Provider value={{ bets, setBets, leagueHistory, lastUpdated }}>
      {children}
    </DataContext.Provider>
  );
};

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
}
