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
  isLoading: boolean;
}

const DataContext = createContext<DataContextValue | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [bets, setBets] = useState<Bet[]>([]);
  const [predictions, setPredictions] = useState<PredictionCategory[]>([]);
  const [teams, setTeams] = useState<WCTeam[]>([]);
  const [bracketEntries, setBracketEntries] = useState<BracketEntry[]>([]);
  const [bracketActual, setBracketActual] = useState<BracketActual>(MOCK_BRACKET_ACTUAL);
  const [leagueHistory, setLeagueHistory] = useState<MonthlyStanding[]>([]);
  const [lastUpdated, setLastUpdated] = useState(LAST_UPDATED);

  useEffect(() => {
    Promise.all([
      fetchBets().then((data) => { setBets(data.length > 0 ? data : MOCK_BETS); }),
      fetchPredictions().then((data) => { setPredictions(data.length > 0 ? data : MOCK_PREDICTIONS); }),
      fetchTeams().then((data) => { setTeams(data.length > 0 ? data : MOCK_TEAMS); }),
      fetchBracketEntries().then((data) => { setBracketEntries(data.length > 0 ? data : MOCK_BRACKET_ENTRIES); }),
      fetchBracketActual().then((data) => { setBracketActual(data || MOCK_BRACKET_ACTUAL); }),
      fetchLeagueHistory().then((data) => { setLeagueHistory(data.length > 0 ? data : LEAGUE_HISTORY); }),
      fetchLastUpdated().then((val) => { setLastUpdated(val || LAST_UPDATED); }),
    ]).finally(() => setIsLoading(false));
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
        isLoading,
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
