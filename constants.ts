
import { NavItem, SectionId, Bet, UserStats, MonthlyStanding, PredictionCategory, WCTeam, BracketEntry, BracketActual } from './types';
import { GROUPS, MATCHES, R32, resolveTeam } from './lib/wcBracket';

// Auto-updated by fetch_and_update.py
export const LAST_UPDATED = 'Wed Jun 10, 7:07 PM EST';

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

// Every existing bet belongs to the wrapped-up 25/26 Premier League season.
export const EPL_25_26: Bet['group'] = { kind: 'CLUB_SEASON', name: 'EPL 25/26', slug: 'epl-25-26' };

// The headline competition for the relaunch.
export const WORLD_CUP_2026: Bet['group'] = { kind: 'INTERNATIONAL_TOURNAMENT', name: 'World Cup 2026', slug: 'world-cup-2026' };
export const EPL_26_27: Bet['group'] = { kind: 'CLUB_SEASON', name: 'EPL 26/27', slug: 'epl-26-27' };

// All known groups, so pages can render a header + empty state even before any
// bets exist (e.g. the upcoming 26/27 season).
export const ALL_GROUPS: Bet['group'][] = [WORLD_CUP_2026, EPL_25_26, EPL_26_27];

export const MOCK_BETS: Bet[] = [
  {
    id: 'bet_01',
    slug: 'odegaard-vs-bruno',
    title: 'Odegaard vs Bruno',
    league: 'EPL',
    season: '2025-2026',
    group: EPL_25_26,
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
      valueA: 6,
      valueB: 21
    }
  },
  {
    id: 'bet_02',
    slug: 'zirkzee-vs-madueke',
    title: 'Zirkzee vs Madueke',
    league: 'EPL + FA CUP + CARABAO',
    season: '2025-2026',
    group: EPL_25_26,
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
      valueB: 3
    }
  },
  {
    id: 'bet_03',
    slug: 'zirkzee-vs-cherki',
    title: 'Zirkzee vs Cherki',
    league: 'EPL + FA CUP + CARABAO',
    season: '2025-2026',
    group: EPL_25_26,
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
      valueB: 16
    }
  },
  {
    id: 'bet_04',
    slug: 'frimpong-vs-nunes',
    title: 'Frimpong vs Nunes',
    league: 'EPL',
    season: '2025-2026',
    group: EPL_25_26,
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
    group: EPL_25_26,
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
      valueA: 12,
      target: 20
    }
  },
  {
    id: 'bet_06',
    slug: 'man-utd-vs-liverpool',
    title: 'Liverpool vs Man Utd',
    league: 'EPL',
    season: '2025-2026',
    group: EPL_25_26,
    type: 'TEAM_VS_TEAM',
    criteria: "Who finishes higher in EPL standings.",
    voidConditions: "Standard rules apply.",
    prize: "Mitch owes Shiv a shoe bag. Shiv does a 90s cold plunge (full body immersion).",
    status: 'SETTLED',
    result: 'SIDE_B',
    winners: ['Shiv'],
    placedAt: '2025-08-15',
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
  },
  {
    id: 'bet_wc_03',
    slug: 'ronaldo-goals-threshold',
    title: 'Ronaldo — 4 Goal Contributions',
    league: 'World Cup',
    season: '2026',
    group: WORLD_CUP_2026,
    type: 'PLAYER_THRESHOLD',
    criteria: "Cristiano Ronaldo to reach 4 or more goal contributions (goals + 0.5 per assist) at the World Cup 2026. Penalty shootout goals and assists do not count.",
    voidConditions: "Void if Portugal fail to qualify or if Ronaldo is ruled out before the tournament begins.",
    prize: "Prize to be decided.",
    status: 'ACTIVE',
    heroImage: "https://picsum.photos/seed/ronaldo-wc/1200/800",
    useCustomHero: true,
    participants: [
      { name: 'Shiv', side: 'A' },
      { name: 'Diogo', side: 'B' }
    ],
    entities: [
      { name: 'Cristiano Ronaldo', type: 'PLAYER', side: 'A', image: "/ronaldo-avatar.jpg" }
    ],
    metrics: {
      label: 'Goal contributions',
      valueA: 0,
      valueB: 0
    }
  },
  {
    id: 'bet_wc_04',
    slug: 'ronaldo-vs-messi-goal-contributions',
    title: 'Ronaldo vs Messi — Goal Contributions',
    league: 'World Cup',
    season: '2026',
    group: WORLD_CUP_2026,
    type: 'PLAYER_VS_PLAYER',
    criteria: "Who finishes the World Cup 2026 with more total goal contributions (goals + assists). Penalty shootout goals and assists do not count.",
    voidConditions: "Void if either player does not participate. If one nation is eliminated early through no fault of the player, the bet still stands.",
    prize: "Prize to be decided.",
    status: 'ACTIVE',
    heroImage: "https://picsum.photos/seed/ronaldo-messi/1200/800",
    useCustomHero: true,
    participants: [
      { name: 'Shiv', side: 'A' },
      { name: 'Mitch', side: 'B' }
    ],
    entities: [
      { name: 'Cristiano Ronaldo', type: 'PLAYER', side: 'A', image: "/ronaldo-avatar.jpg" },
      { name: 'Lionel Messi', type: 'PLAYER', side: 'B', image: "/messi-avatar.jpg" }
    ],
    metrics: {
      label: 'Goal contributions',
      valueA: 0,
      valueB: 0
    }
  }
];

// World Cup 2026 prediction categories. Picks are admin-managed; one is shown
// SETTLED to exercise scoring offline. Replace with real calls via /admin.
export const MOCK_PREDICTIONS: PredictionCategory[] = [
  {
    id: 'pred_01',
    groupSlug: 'world-cup-2026',
    name: 'Tournament Winner',
    details: 'Which nation lifts the trophy in the final.',
    order: 1,
    status: 'OPEN',
    picks: { Diogo: 'France', Mitch: 'Brazil', Shiv: 'England' },
  },
  {
    id: 'pred_02',
    groupSlug: 'world-cup-2026',
    name: 'Golden Boot',
    details: 'Top goalscorer across the whole tournament.',
    order: 2,
    status: 'SETTLED',
    correctAnswer: 'Kylian Mbappé',
    picks: { Diogo: 'Kylian Mbappé', Mitch: 'Harry Kane', Shiv: 'Vinícius Júnior' },
  },
  {
    id: 'pred_03',
    groupSlug: 'world-cup-2026',
    name: 'Golden Ball',
    details: 'Best overall player of the tournament.',
    order: 3,
    status: 'OPEN',
    picks: { Diogo: 'Jude Bellingham', Mitch: 'Lionel Messi', Shiv: 'Vinícius Júnior' },
  },
  {
    id: 'pred_04',
    groupSlug: 'world-cup-2026',
    name: 'Best Young Player',
    details: 'Standout player aged 21 or under.',
    order: 4,
    status: 'OPEN',
    picks: { Diogo: 'Lamine Yamal', Mitch: 'Endrick', Shiv: 'Arda Güler' },
  },
  {
    id: 'pred_05',
    groupSlug: 'world-cup-2026',
    name: 'Dark Horse',
    details: 'Outsider that makes a surprise deep run.',
    order: 5,
    status: 'OPEN',
    picks: { Diogo: 'Morocco', Mitch: 'USA', Shiv: 'Japan' },
  },
  {
    id: 'pred_06',
    groupSlug: 'world-cup-2026',
    name: 'Top Scoring Team',
    details: 'Nation that scores the most goals overall.',
    order: 6,
    status: 'OPEN',
    picks: { Diogo: 'France', Mitch: 'Brazil', Shiv: 'Spain' },
  },
];

// ── World Cup 2026 bracket seed ───────────────────────────────────
// 48 teams across 12 groups. Placeholder line-ups — replace via admin once the
// real draw is known. [name, code] per group A–L.
const WC_GROUP_TEAMS: Record<string, [string, string][]> = {
  A: [['Mexico', 'MEX'], ['Croatia', 'CRO'], ['Ecuador', 'ECU'], ['Cameroon', 'CMR']],
  B: [['Canada', 'CAN'], ['Belgium', 'BEL'], ['Morocco', 'MAR'], ['Qatar', 'QAT']],
  C: [['United States', 'USA'], ['Netherlands', 'NED'], ['Ghana', 'GHA'], ['Saudi Arabia', 'KSA']],
  D: [['Argentina', 'ARG'], ['Australia', 'AUS'], ['Poland', 'POL'], ['Egypt', 'EGY']],
  E: [['France', 'FRA'], ['Senegal', 'SEN'], ['Japan', 'JPN'], ['Costa Rica', 'CRC']],
  F: [['Brazil', 'BRA'], ['Switzerland', 'SUI'], ['Serbia', 'SRB'], ['South Korea', 'KOR']],
  G: [['England', 'ENG'], ['Uruguay', 'URU'], ['Iran', 'IRN'], ['Tunisia', 'TUN']],
  H: [['Spain', 'ESP'], ['Denmark', 'DEN'], ['Nigeria', 'NGA'], ['New Zealand', 'NZL']],
  I: [['Portugal', 'POR'], ['Colombia', 'COL'], ['Ivory Coast', 'CIV'], ['Jamaica', 'JAM']],
  J: [['Germany', 'GER'], ['Peru', 'PER'], ['Algeria', 'ALG'], ['Panama', 'PAN']],
  K: [['Italy', 'ITA'], ['Chile', 'CHI'], ['Mali', 'MLI'], ['Honduras', 'HON']],
  L: [['Wales', 'WAL'], ['Sweden', 'SWE'], ['Paraguay', 'PAR'], ['United Arab Emirates', 'UAE']],
};

export const MOCK_TEAMS: WCTeam[] = GROUPS.flatMap((grp) =>
  (WC_GROUP_TEAMS[grp] ?? []).map(([name, code]) => ({ id: code.toLowerCase(), name, code, group: grp })),
);

const teamIdsByGroup = (grp: string) => MOCK_TEAMS.filter((t) => t.group === grp).map((t) => t.id);
const rotate = <T,>(arr: T[], n: number): T[] => {
  const a = [...arr];
  for (let i = 0; i < (n % a.length); i++) a.push(a.shift() as T);
  return a;
};

const buildGroupOrders = (rot: number): Record<string, string[]> => {
  const o: Record<string, string[]> = {};
  for (const grp of GROUPS) o[grp] = rotate(teamIdsByGroup(grp), rot);
  return o;
};

// Walk the bracket in order, advancing the higher-seeded ('a') slot by default.
const buildKnockout = (groupOrders: Record<string, string[]>): Record<string, string> => {
  const ko: Record<string, string> = {};
  for (const m of MATCHES) {
    const a = resolveTeam(m.a, groupOrders, ko);
    const b = resolveTeam(m.b, groupOrders, ko);
    const winner = a ?? b;
    if (winner) ko[m.id] = winner;
  }
  return ko;
};

const entryFor = (participant: string, rot: number): BracketEntry => {
  const groupOrders = buildGroupOrders(rot);
  return { id: `be_${participant.toLowerCase()}`, participant, groupOrders, knockout: buildKnockout(groupOrders) };
};

export const MOCK_BRACKET_ENTRIES: BracketEntry[] = [
  entryFor('Diogo', 0),
  entryFor('Mitch', 1),
  entryFor('Shiv', 2),
];

// Actual results: group stage decided, knockout only through the Round of 32.
const actualGroupOrders = buildGroupOrders(0);
const fullActualKnockout = buildKnockout(actualGroupOrders);
export const MOCK_BRACKET_ACTUAL: BracketActual = {
  groupOrders: actualGroupOrders,
  knockout: Object.fromEntries(R32.map((m) => [m.id, fullActualKnockout[m.id]]).filter(([, v]) => v)),
};

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
  },
  {
    month: 'MAY',
    year: '2026',
    scores: {
      Diogo: 3,
      Shiv: 2,
      Mitch: 1
    }
  },
  {
    month: 'JUN',
    year: '2026',
    scores: {
      Diogo: 3,
      Shiv: 2,
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
