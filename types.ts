
export interface NavItem {
  label: string;
  id: string;
}

export enum SectionId {
  HOME = 'home',
  DASHBOARD = 'dashboard',
  HISTORY = 'history',
}

export type BetStatus = 'ACTIVE' | 'PENDING' | 'SETTLED' | 'VOID';
export type Side = 'A' | 'B' | 'NONE';

export interface Participant {
  name: string;
  side: Side;
}

export interface BetEntity {
  name: string;
  type: 'PLAYER' | 'TEAM';
  side: Side;
  image: string; // Made required for the visual design
}

export interface Bet {
  id: string;
  slug: string;
  title: string;
  league: string;
  season: string;
  type: 'PLAYER_VS_PLAYER' | 'PLAYER_THRESHOLD' | 'TEAM_VS_TEAM';
  
  // The Rules
  criteria: string;
  voidConditions: string;
  prize: string;
  
  // Who is involved
  participants: Participant[];
  entities: BetEntity[];
  
  status: BetStatus;
  heroImage: string; // This is now the BACKGROUND texture
  useCustomHero?: boolean; // Flag to override default split-player view
  
  // Mock Data for Visualization
  metrics?: {
    label: string; // e.g. "Assists", "G/A"
    valueA: number;
    valueB?: number; // Optional for threshold bets
    target?: number; // For threshold bets
    isInverse?: boolean; // If true, lower value is better (e.g. league position)
    maxValue?: number; // For scaling (e.g. 20 for league position)
  };
}

export interface UserStats {
  totalBets: number;
  winRate: number;
  profit: number; // Changed to generic "wins"
  currentStreak: number;
}

export interface GenerationResult {
  strategy: string;
  focusPoints: string[];
}

export interface MonthlyStanding {
  month: string;
  year: string;
  scores: {
    [participantName: string]: number;
  };
}
