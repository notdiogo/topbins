
import { NavItem, SectionId, Bet, UserStats, MonthlyStanding } from './types';

// Auto-updated by fetch_and_update.py
export const LAST_UPDATED = 'Fri Apr 24, 6:31 PM EST';

export const NAV_ITEMS: NavItem[] = [
  { label: 'HQ', id: SectionId.HOME },
  { label: 'LEDGER', id: SectionId.DASHBOARD },
  { label: 'ARCHIVE', id: SectionId.HISTORY },
];

export const MOCK_USER_STATS: UserStats = {
  totalBets: 5,
  winRate: 0,
  profit: 0,
  currentStreak: 0
};

export const MOCK_IMAGES = {
  HERO: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1931&auto=format&fit=crop",
  TEXTURE_METALLIC: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop",
  STREET_1: "https://images.unsplash.com/photo-1486286701208-1d58e9338013?q=80&w=2070&auto=format&fit=crop",
  STREET_2: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=1931&auto=format&fit=crop",
};

// Proxy images for players (Urban/Sport style)
const PLAYER_IMGS = {
  ODEGAARD: "/Martin-avatar.png",
  BRUNO: "/Bruno-avatar.png",
  NONI: "/Noni-avatar.png",
  ZIRKZEE: "/Zirkzee-avatar.png",
  CHERKI: "/Cherki-avatar.png",
  FRIMPONG: "/Frimpong-avatar.png",
  NUNES: "/Nunes-avatar.png",
  CUNHA: "/Cunha-avatar.png",
};

export const MOCK_BETS: Bet[] = [
  {
    id: 'bet_01',
    slug: 'odegaard-vs-bruno',
    title: 'Odegaard vs Bruno',
    league: 'EPL',
    season: '2025-2026',
    type: 'PLAYER_VS_PLAYER',
    criteria: "Straight comparison of total assists in the Premier League.",
    voidConditions: "Bet void if one player accumulates 2 months more injury time than the other.",
    prize: "Winner receives one jersey or teamwear item.",
    status: 'ACTIVE',
    heroImage: "/martin-bruno.png",
    useCustomHero: true,
    participants: [
      { name: 'Mitch', side: 'A' },
      { name: 'Shiv', side: 'B' }
    ],
    entities: [
      { name: 'Martin Odegaard', type: 'PLAYER', side: 'A', image: PLAYER_IMGS.ODEGAARD },
      { name: 'Bruno Fernandes', type: 'PLAYER', side: 'B', image: PLAYER_IMGS.BRUNO }
    ],
    metrics: {
      label: 'Assists',
      valueA: 5,
      valueB: 18
    }
  },
  {
    id: 'bet_02',
    slug: 'zirkzee-vs-madueke',
    title: 'Zirkzee vs Madueke',
    league: 'EPL + FA CUP + CARABAO',
    season: '2025-2026',
    type: 'PLAYER_VS_PLAYER',
    criteria: "Most combined Goals + Assists (G/A) across EPL, Carabao Cup, and FA Cup. Minutes played are ignored.",
    voidConditions: "Bet void if one player accumulates 2 months more injury time than the other.",
    prize: "Prize to be decided.",
    status: 'ACTIVE',
    heroImage: "/noni-zirk.png",
    useCustomHero: true,
    participants: [
      { name: 'Shiv', side: 'A' },
      { name: 'Mitch', side: 'B' }
    ],
    entities: [
      { name: 'Joshua Zirkzee', type: 'PLAYER', side: 'A', image: PLAYER_IMGS.ZIRKZEE },
      { name: 'Noni Madueke', type: 'PLAYER', side: 'B', image: PLAYER_IMGS.NONI }
    ],
    metrics: {
      label: 'G/A (All Comps)',
      valueA: 3,
      valueB: 2
    }
  },
  {
    id: 'bet_03',
    slug: 'zirkzee-vs-cherki',
    title: 'Zirkzee vs Cherki',
    league: 'EPL + FA CUP + CARABAO',
    season: '2025-2026',
    type: 'PLAYER_VS_PLAYER',
    criteria: "Most combined Goals + Assists (G/A) across EPL, Carabao Cup, and FA Cup. Minutes played are ignored.",
    voidConditions: "Bet void if one player suffers two months more injury than the other.",
    prize: "Shiv owes one espresso bean coffee bag. Diogo owes one sleeve of Nespresso pods.",
    status: 'ACTIVE',
    heroImage: "/zirk-chirk.png",
    useCustomHero: true,
    participants: [
      { name: 'Shiv', side: 'A' },
      { name: 'Diogo', side: 'B' }
    ],
    entities: [
      { name: 'Joshua Zirkzee', type: 'PLAYER', side: 'A', image: PLAYER_IMGS.ZIRKZEE },
      { name: 'Rayan Cherki', type: 'PLAYER', side: 'B', image: PLAYER_IMGS.CHERKI }
    ],
    metrics: {
      label: 'G/A (All Comps)',
      valueA: 3,
      valueB: 14
    }
  },
  {
    id: 'bet_04',
    slug: 'frimpong-vs-nunes',
    title: 'Frimpong vs Nunes',
    league: 'EPL',
    season: '2025-2026',
    type: 'PLAYER_VS_PLAYER',
    criteria: "Highest average FotMob rating across the season. Minimum 25 matches played required.",
    voidConditions: "If either player finishes the season with fewer than 25 matches played.",
    prize: "Prize to be decided.",
    status: 'ACTIVE',
    heroImage: "/frimpong-nunes.png",
    useCustomHero: true,
    participants: [
      { name: 'Shiv', side: 'A' },
      { name: 'Diogo', side: 'B' }
    ],
    entities: [
      { name: 'Jeremie Frimpong', type: 'PLAYER', side: 'A', image: PLAYER_IMGS.FRIMPONG },
      { name: 'Matheus Nunes', type: 'PLAYER', side: 'B', image: PLAYER_IMGS.NUNES }
    ],
    metrics: {
      label: 'Avg Rating',
      valueA: 6.8,
      valueB: 7.4
    }
  },
  {
    id: 'bet_05',
    slug: 'cunha-threshold',
    title: 'Matheus Cunha Target',
    league: 'EPL',
    season: '2025-2026',
    type: 'PLAYER_THRESHOLD',
    criteria: "Reach 20 Non-Penalty Goals + Assists (G/A) in the Premier League.",
    voidConditions: "Void if Cunha suffers two injuries totaling 12+ weeks.",
    prize: "Pack of 12 golf balls (Titleist Pro V1 equivalent).",
    status: 'ACTIVE',
    heroImage: "/cunha-large.png",
    participants: [
      { name: 'Shiv', side: 'A' },
      { name: 'Diogo', side: 'B' },
      { name: 'Mitch', side: 'B' }
    ],
    entities: [
      { name: 'Matheus Cunha', type: 'PLAYER', side: 'A', image: PLAYER_IMGS.CUNHA }
    ],
    metrics: {
      label: 'Non-Pen G/A',
      valueA: 10,
      target: 20
    }
  },
  {
    id: 'bet_06',
    slug: 'man-utd-vs-liverpool',
    title: 'Liverpool vs Man Utd',
    league: 'EPL',
    season: '2025-2026',
    type: 'TEAM_VS_TEAM',
    criteria: "Who finishes higher in EPL standings.",
    voidConditions: "Standard rules apply.",
    prize: "Mitch owes Shiv a shoe bag. Shiv does a 90s cold plunge (full body immersion).",
    status: 'ACTIVE',
    heroImage: "/liverpoolvsunited.png",
    useCustomHero: true,
    participants: [
      { name: 'Mitch', side: 'A' },
      { name: 'Shiv', side: 'B' }
    ],
    entities: [
        { name: 'Liverpool', type: 'TEAM', side: 'A', image: "/Liverpool.png" },
      { name: 'Manchester United', type: 'TEAM', side: 'B', image: "/United.png" }
    ],
    metrics: {
      label: 'League Position',
      valueA: 5,
      valueB: 3,
      isInverse: true,
      maxValue: 20
    }
  }
];

export const LEAGUE_HISTORY: MonthlyStanding[] = [
  {
    month: 'OCT',
    year: '2025',
    scores: {
      Diogo: 3,
      Shiv: 1,
      Mitch: 2
    }
  },
  {
    month: 'NOV',
    year: '2025',
    scores: {
      Diogo: 3,
      Shiv: 2,
      Mitch: 1
    }
  },
  {
    month: 'JAN',
    year: '2026',
    scores: {
      Diogo: 3,
      Shiv: 1,
      Mitch: 3
    }
  },
  {
    month: 'FEB',
    year: '2026',
    scores: {
      Diogo: 3,
      Shiv: 2,
      Mitch: 1
    }
  },
  {
    month: 'MAR',
    year: '2026',
    scores: {
      Diogo: 3,
      Shiv: 3,
      Mitch: 1
    }
  },
  {
    month: 'APR',
    year: '2026',
    scores: {
      Diogo: 3,
      Shiv: 3,
      Mitch: 1
    }
  }
];

export const TECH_SPECS = [
  {
    title: "Tracking Engine",
    description: "Monitoring 5 simultaneous player feeds across EPL, FA Cup, and Carabao Cup data sources.",
    icon: "target",
    gridArea: "col-span-1 row-span-1"
  },
  {
    title: "Void Condition Protocol",
    description: "Automated injury duration analysis to trigger void clauses immediately upon threshold breach.",
    icon: "zap",
    gridArea: "col-span-1 row-span-1"
  },
  {
    title: "Settlement Ledger",
    description: "Immutable record of all friendly wagers, prizes, and coffee debts.",
    icon: "activity",
    gridArea: "col-span-2 row-span-2"
  }
];
