import { Bet, BetGroup } from '../types';

export interface GroupSummary extends BetGroup {
  total: number;
  active: number;
  settled: number; // SETTLED + VOID
}

// Distinct groups present in the bet set, with status counts, ordered by
// kind (tournaments first) then by number of active bets.
export function getGroupSummaries(bets: Bet[]): GroupSummary[] {
  const map = new Map<string, GroupSummary>();
  for (const bet of bets) {
    const { slug, name, kind } = bet.group;
    if (!slug) continue;
    const g = map.get(slug) ?? { slug, name, kind, total: 0, active: 0, settled: 0 };
    g.total += 1;
    if (bet.status === 'ACTIVE' || bet.status === 'PENDING') g.active += 1;
    if (bet.status === 'SETTLED' || bet.status === 'VOID') g.settled += 1;
    map.set(slug, g);
  }
  return [...map.values()].sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'INTERNATIONAL_TOURNAMENT' ? -1 : 1;
    return b.active - a.active;
  });
}

export const GROUP_KIND_LABEL: Record<BetGroup['kind'], string> = {
  CLUB_SEASON: 'Club Season',
  INTERNATIONAL_TOURNAMENT: 'International Tournament',
};

export type StatusFilter = 'ALL' | 'ACTIVE' | 'SETTLED';

export function matchesStatusFilter(bet: Bet, filter: StatusFilter): boolean {
  if (filter === 'ALL') return true;
  if (filter === 'ACTIVE') return bet.status === 'ACTIVE' || bet.status === 'PENDING';
  return bet.status === 'SETTLED' || bet.status === 'VOID';
}
