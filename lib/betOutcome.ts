import { Bet } from '../types';

// Infer the winning side of an active bet from its live metrics.
// Returns null when there's no metric, or the bet is currently tied.
export function inferWinningSide(bet: Bet): 'A' | 'B' | null {
  const { metrics } = bet;
  if (!metrics) return null;
  const { valueA, valueB = 0, target, isInverse } = metrics;
  if (bet.type === 'PLAYER_THRESHOLD') {
    if (!target) return null;
    return valueA >= target ? 'A' : 'B';
  }
  if (valueA === valueB) return null;
  return isInverse ? (valueA < valueB ? 'A' : 'B') : (valueA > valueB ? 'A' : 'B');
}

function participantsOnSide(bet: Bet, side: 'A' | 'B'): string[] {
  return bet.participants.filter(p => p.side === side).map(p => p.name);
}

// The participant names that win a bet.
// - SETTLED / VOID: prefer the recorded `winners`; else derive from `result`.
//   PUSH and VOID yield no winners.
// - ACTIVE / PENDING: infer the leading side from live metrics.
export function resolveWinners(bet: Bet): string[] {
  if (bet.status === 'SETTLED' || bet.status === 'VOID') {
    if (bet.winners && bet.winners.length) return bet.winners;
    if (bet.result === 'SIDE_A') return participantsOnSide(bet, 'A');
    if (bet.result === 'SIDE_B') return participantsOnSide(bet, 'B');
    return []; // PUSH, VOID, or unset
  }
  const side = inferWinningSide(bet);
  return side ? participantsOnSide(bet, side) : [];
}
