import { Bet } from '../types';
import { resolveWinners } from './betOutcome';

export const BETTORS = ['Diogo', 'Shiv', 'Mitch'] as const;
export type Bettor = (typeof BETTORS)[number];

export interface PersonRecord {
  name: string;
  won: number;   // settled bets this person won
  lost: number;  // settled bets this person was in but didn't win (excl. PUSH/VOID)
  void: number;  // bets this person was in that ended VOID
  leading: number; // active bets this person is currently winning (inferred)
}

const isSettledDecisive = (bet: Bet) =>
  bet.status === 'SETTLED' && bet.result !== 'PUSH' && bet.result !== 'VOID';

function isParticipant(bet: Bet, name: string): boolean {
  return bet.participants.some((p) => p.name === name && p.side !== 'NONE');
}

// Per-person won/lost/void/leading record across the given bets.
export function computeRecords(bets: Bet[], names: readonly string[] = BETTORS): PersonRecord[] {
  return names.map((name) => {
    const rec: PersonRecord = { name, won: 0, lost: 0, void: 0, leading: 0 };
    for (const bet of bets) {
      if (!isParticipant(bet, name)) continue;
      const winners = resolveWinners(bet);
      if (bet.status === 'VOID') {
        rec.void += 1;
      } else if (isSettledDecisive(bet)) {
        if (winners.includes(name)) rec.won += 1;
        else rec.lost += 1;
      } else if (bet.status === 'ACTIVE' || bet.status === 'PENDING') {
        if (winners.includes(name)) rec.leading += 1;
      }
    }
    return rec;
  });
}

export interface BetTotals {
  total: number;
  active: number;
  settled: number; // decisive settled
  void: number;
  push: number;
}

export function computeTotals(bets: Bet[]): BetTotals {
  const t: BetTotals = { total: bets.length, active: 0, settled: 0, void: 0, push: 0 };
  for (const bet of bets) {
    if (bet.status === 'ACTIVE' || bet.status === 'PENDING') t.active += 1;
    else if (bet.status === 'VOID') t.void += 1;
    else if (bet.status === 'SETTLED') {
      if (bet.result === 'PUSH') t.push += 1;
      else t.settled += 1;
    }
  }
  return t;
}

export const winRate = (rec: PersonRecord): number => {
  const decided = rec.won + rec.lost;
  return decided === 0 ? 0 : Math.round((rec.won / decided) * 100);
};
