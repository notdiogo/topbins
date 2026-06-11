import { PredictionCategory, BracketEntry, BracketActual } from '../types';
import { BETTORS } from './stats';
import { GROUPS, MATCHES, ROUND_POINTS } from './wcBracket';

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

// Per-person points from settled predictions: +1 for each pick that matches the
// admin-recorded correctAnswer (case/space-insensitive).
export function predictionPoints(
  categories: PredictionCategory[],
  names: readonly string[] = BETTORS,
): Record<string, number> {
  const pts: Record<string, number> = {};
  names.forEach((n) => (pts[n] = 0));
  for (const cat of categories) {
    if (cat.status !== 'SETTLED' || !cat.correctAnswer) continue;
    const correct = norm(cat.correctAnswer);
    for (const name of names) {
      const pick = cat.picks[name];
      if (pick && norm(pick) === correct) pts[name] += 1;
    }
  }
  return pts;
}

// Per-person bracket points: +1 for each correctly predicted group qualifier
// (a team in the actual top-2 of its group), plus escalating points for each
// correct knockout winner (R32 +1 … Final +5).
export function bracketPoints(
  entries: BracketEntry[],
  actual: BracketActual,
): Record<string, number> {
  const pts: Record<string, number> = {};
  for (const entry of entries) {
    let total = 0;

    // Group stage: correct qualifiers (top two).
    for (const grp of GROUPS) {
      const actualTop2 = new Set((actual.groupOrders[grp] ?? []).slice(0, 2));
      if (actualTop2.size === 0) continue;
      const predTop2 = (entry.groupOrders[grp] ?? []).slice(0, 2);
      for (const teamId of predTop2) if (actualTop2.has(teamId)) total += 1;
    }

    // Knockout: correct match winners, weighted by round.
    for (const m of MATCHES) {
      const actualWinner = actual.knockout[m.id];
      if (!actualWinner) continue;
      if (entry.knockout[m.id] === actualWinner) total += ROUND_POINTS[m.round];
    }

    pts[entry.participant] = total;
  }
  return pts;
}

export interface WCStanding {
  name: string;
  predictions: number;
  brackets: number;
  total: number;
}

// Combined World Cup standings = prediction points + bracket points per person.
// bracketPts is wired in during Phase 4 (defaults to zero until then).
export function wcStandings(
  predictionPts: Record<string, number>,
  bracketPts: Record<string, number> = {},
  names: readonly string[] = BETTORS,
): WCStanding[] {
  return names
    .map((name) => {
      const predictions = predictionPts[name] ?? 0;
      const brackets = bracketPts[name] ?? 0;
      return { name, predictions, brackets, total: predictions + brackets };
    })
    .sort((a, b) => b.total - a.total);
}
