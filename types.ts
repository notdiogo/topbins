
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

// How a bet is grouped for navigation: a club season or an international tournament.
export type GroupKind = 'CLUB_SEASON' | 'INTERNATIONAL_TOURNAMENT';
export interface BetGroup {
  kind: GroupKind;
  name: string; // e.g. "EPL 25/26", "World Cup 2026"
  slug: string; // e.g. "epl-25-26"
}

// The recorded outcome of a settled bet. `winners` (participant names) is the
// authoritative tally; `result` carries the side semantics.
export type BetResult = 'SIDE_A' | 'SIDE_B' | 'PUSH' | 'VOID';

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
  group: BetGroup;
  type: 'PLAYER_VS_PLAYER' | 'PLAYER_THRESHOLD' | 'TEAM_VS_TEAM';
  
  // The Rules
  criteria: string;
  voidConditions: string;
  prize: string;
  
  // Who is involved
  participants: Participant[];
  entities: BetEntity[];
  
  status: BetStatus;
  // Settlement / outcome (set when status is SETTLED or VOID)
  result?: BetResult;
  winners?: string[]; // participant names credited with the win (authoritative for stats)
  placedAt?: string;  // ISO date the bet was placed (sorting, streaks)
  stake?: number;     // groundwork for profit/ROI
  payout?: number;
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

// ── World Cup Predictions ─────────────────────────────────────────
// A category each person makes one call on (e.g. "Golden Boot"). One point
// per pick that matches the admin-recorded correctAnswer once SETTLED.
export type PredictionStatus = 'OPEN' | 'SETTLED' | 'VOID';
export interface PredictionCategory {
  id: string;
  groupSlug: string;                  // which competition (e.g. 'world-cup-2026')
  name: string;                       // e.g. "Golden Boot"
  details: string;                    // tooltip explaining the category
  order: number;                      // display order
  picks: Record<string, string>;      // participant name -> their predicted answer
  correctAnswer?: string;             // set by admin when known
  status: PredictionStatus;
}

// ── World Cup Brackets ────────────────────────────────────────────
export interface WCTeam {
  id: string;     // 'fra'
  name: string;   // 'France'
  code: string;   // 'FRA'
  group: string;  // 'A'..'L'
}

// One person's full bracket: predicted finishing order per group + chosen winner
// per knockout match (keyed by match id from lib/wcBracket).
export interface BracketEntry {
  id: string;
  participant: string;                     // 'Diogo' | 'Mitch' | 'Shiv'
  groupOrders: Record<string, string[]>;   // group -> [teamId x4] in predicted order
  knockout: Record<string, string>;        // matchId -> predicted winning teamId
}

// The real results, maintained by admin as the tournament unfolds.
export interface BracketActual {
  groupOrders: Record<string, string[]>;
  knockout: Record<string, string>;
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
