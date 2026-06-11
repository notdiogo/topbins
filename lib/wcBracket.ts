// World Cup 2026 tournament structure: 12 groups of 4, then a 32-team
// single-elimination knockout (R32 → Final). The R32 participants are derived
// from each person's predicted group finishing order, so picking group orders
// automatically seeds the bracket; from there each match stores a chosen winner.

export const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] as const;
export type GroupId = (typeof GROUPS)[number];

export type KnockoutRound = 'R32' | 'R16' | 'QF' | 'SF' | 'F';

export const ROUNDS: { id: KnockoutRound; label: string; short: string; points: number }[] = [
  { id: 'R32', label: 'Round of 32', short: 'R32', points: 1 },
  { id: 'R16', label: 'Round of 16', short: 'R16', points: 2 },
  { id: 'QF', label: 'Quarter-finals', short: 'QF', points: 3 },
  { id: 'SF', label: 'Semi-finals', short: 'SF', points: 4 },
  { id: 'F', label: 'Final', short: 'Final', points: 5 },
];
export const ROUND_POINTS: Record<KnockoutRound, number> =
  Object.fromEntries(ROUNDS.map((r) => [r.id, r.points])) as Record<KnockoutRound, number>;

// A match slot is fed either by a group position (1st/2nd/3rd) or by the winner
// of an earlier match.
export type Source =
  | { kind: 'group'; group: GroupId; pos: 1 | 2 | 3 }
  | { kind: 'match'; matchId: string };

export interface KnockoutMatch {
  id: string;
  round: KnockoutRound;
  a: Source;
  b: Source;
}

const g = (group: GroupId, pos: 1 | 2 | 3): Source => ({ kind: 'group', group, pos });
const w = (matchId: string): Source => ({ kind: 'match', matchId });

// Round of 32 — actual WC 2026 bracket seeding.
// Winners (1st), runners-up (2nd), and 8 best third-place (3rd) teams advance.
// Bracket pairs: R32-1+R32-2 → R16-1, R32-3+R32-4 → R16-2, etc.
export const R32: KnockoutMatch[] = [
  { id: 'R32-1',  round: 'R32', a: g('I', 1), b: g('F', 3) },
  { id: 'R32-2',  round: 'R32', a: g('E', 1), b: g('D', 3) },
  { id: 'R32-3',  round: 'R32', a: g('A', 2), b: g('B', 2) },
  { id: 'R32-4',  round: 'R32', a: g('F', 1), b: g('C', 2) },
  { id: 'R32-5',  round: 'R32', a: g('L', 2), b: g('K', 2) },
  { id: 'R32-6',  round: 'R32', a: g('H', 1), b: g('J', 2) },
  { id: 'R32-7',  round: 'R32', a: g('D', 1), b: g('E', 3) },
  { id: 'R32-8',  round: 'R32', a: g('G', 1), b: g('A', 3) },
  { id: 'R32-9',  round: 'R32', a: g('I', 3), b: g('E', 2) },
  { id: 'R32-10', round: 'R32', a: g('C', 1), b: g('F', 2) },
  { id: 'R32-11', round: 'R32', a: g('L', 1), b: g('I', 2) },
  { id: 'R32-12', round: 'R32', a: g('A', 1), b: g('C', 3) },
  { id: 'R32-13', round: 'R32', a: g('J', 1), b: g('H', 2) },
  { id: 'R32-14', round: 'R32', a: g('G', 2), b: g('D', 2) },
  { id: 'R32-15', round: 'R32', a: g('K', 1), b: g('L', 3) },
  { id: 'R32-16', round: 'R32', a: g('B', 1), b: g('J', 3) },
];

const pairUp = (round: KnockoutRound, prefix: string, prev: KnockoutMatch[]): KnockoutMatch[] => {
  const out: KnockoutMatch[] = [];
  for (let i = 0; i < prev.length; i += 2) {
    out.push({ id: `${prefix}-${i / 2 + 1}`, round, a: w(prev[i].id), b: w(prev[i + 1].id) });
  }
  return out;
};

export const R16 = pairUp('R16', 'R16', R32);
export const QF = pairUp('QF', 'QF', R16);
export const SF = pairUp('SF', 'SF', QF);
export const FINAL = pairUp('F', 'F', SF);

export const MATCHES: KnockoutMatch[] = [...R32, ...R16, ...QF, ...SF, ...FINAL];
export const MATCHES_BY_ROUND: Record<KnockoutRound, KnockoutMatch[]> = {
  R32, R16, QF, SF, F: FINAL,
};
export const MATCH_BY_ID: Record<string, KnockoutMatch> =
  Object.fromEntries(MATCHES.map((m) => [m.id, m]));

// Resolve which team occupies a source slot for a given set of group orders +
// chosen match winners. Returns undefined when not yet determined.
export function resolveTeam(
  src: Source,
  groupOrders: Record<string, string[]>,
  knockout: Record<string, string>,
): string | undefined {
  if (src.kind === 'group') return groupOrders[src.group]?.[src.pos - 1];
  return knockout[src.matchId];
}

// Short label for an unresolved source (e.g. "1A", "2B", "3C", or "W R32-1").
export function sourceLabel(src: Source): string {
  if (src.kind === 'group') return `${src.pos}${src.group}`;
  return `W ${src.matchId}`;
}
