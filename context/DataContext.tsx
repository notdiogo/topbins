import React, { createContext, useContext, useEffect, useState } from 'react';
import { Bet, MonthlyStanding, PredictionCategory, WCTeam, BracketEntry, BracketActual } from '../types';
import {
  MOCK_BETS, LEAGUE_HISTORY, LAST_UPDATED, MOCK_PREDICTIONS,
  MOCK_TEAMS, MOCK_BRACKET_ENTRIES, MOCK_BRACKET_ACTUAL,
} from '../constants';
import {
  fetchBets, fetchLeagueHistory, fetchLastUpdated, fetchPredictions,
  fetchTeams, fetchBracketEntries, fetchBracketActual,
} from '../services/supabaseService';

interface DataContextValue {
  bets: Bet[];
  setBets: React.Dispatch<React.SetStateAction<Bet[]>>;
  predictions: PredictionCategory[];
  setPredictions: React.Dispatch<React.SetStateAction<PredictionCategory[]>>;
  teams: WCTeam[];
  setTeams: React.Dispatch<React.SetStateAction<WCTeam[]>>;
  bracketEntries: BracketEntry[];
  setBracketEntries: React.Dispatch<React.SetStateAction<BracketEntry[]>>;
  bracketActual: BracketActual;
  setBracketActual: React.Dispatch<React.SetStateAction<BracketActual>>;
  leagueHistory: MonthlyStanding[];
  lastUpdated: string;
}

const DataContext = createContext<DataContextValue | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bets, setBets] = useState<Bet[]>(MOCK_BETS);
  const [predictions, setPredictions] = useState<PredictionCategory[]>(MOCK_PREDICTIONS);
  const [teams, setTeams] = useState<WCTeam[]>(MOCK_TEAMS);
  const [bracketEntries, setBracketEntries] = useState<BracketEntry[]>(MOCK_BRACKET_ENTRIES);
  const [bracketActual, setBracketActual] = useState<BracketActual>(MOCK_BRACKET_ACTUAL);
  const [leagueHistory, setLeagueHistory] = useState<MonthlyStanding[]>(LEAGUE_HISTORY);
  const [lastUpdated, setLastUpdated] = useState(LAST_UPDATED);

  useEffect(() => {
    fetchBets().then((data) => { if (data.length > 0) setBets(data); });
    fetchPredictions().then((data) => { if (data.length > 0) setPredictions(data); });
    fetchTeams().then((data) => { if (data.length > 0) setTeams(data); });
    fetchBracketEntries().then((data) => { if (data.length > 0) setBracketEntries(data); });
    fetchBracketActual().then((data) => { if (data) setBracketActual(data); });
    fetchLeagueHistory().then((data) => { if (data.length > 0) setLeagueHistory(data); });
    fetchLastUpdated().then((val) => { if (val) setLastUpdated(val); });
  }, []);

  return (
    <DataContext.Provider
      value={{
        bets, setBets,
        predictions, setPredictions,
        teams, setTeams,
        bracketEntries, setBracketEntries,
        bracketActual, setBracketActual,
        leagueHistory, lastUpdated,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
}
