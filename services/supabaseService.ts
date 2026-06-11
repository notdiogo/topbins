/**
 * Data fetching service — reads from Supabase when credentials are
 * configured, silently falls back to the local constants otherwise.
 *
 * This means the app continues to work in dev without any .env.local
 * values set.  Once VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are
 * added, all three functions will pull live data automatically.
 */

import { supabase } from '../lib/supabase';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import { Bet, MonthlyStanding } from '../types';
import { MOCK_BETS, LEAGUE_HISTORY, LAST_UPDATED } from '../constants';

// ── helpers ─────────────────────────────────────────────────

// Map snake_case DB columns → camelCase Bet interface
function rowToBet(row: Record<string, unknown>): Bet {
  return {
    id:              row.id as string,
    slug:            row.slug as string,
    title:           row.title as string,
    league:          row.league as string,
    season:          row.season as string,
    group: {
      kind: (row.group_kind as Bet['group']['kind']) ?? 'CLUB_SEASON',
      name: (row.group_name as string) ?? '',
      slug: (row.group_slug as string) ?? '',
    },
    type:            row.type as Bet['type'],
    criteria:        row.criteria as string,
    voidConditions:  row.void_conditions as string,
    prize:           row.prize as string,
    status:          row.status as Bet['status'],
    result:          (row.result as Bet['result']) ?? undefined,
    winners:         (row.winners as string[] | null) ?? [],
    placedAt:        (row.placed_at as string | null) ?? undefined,
    stake:           (row.stake as number | null) ?? undefined,
    payout:          (row.payout as number | null) ?? undefined,
    heroImage:       row.hero_image as string,
    useCustomHero:   row.use_custom_hero as boolean | undefined,
    participants:    row.participants as Bet['participants'],
    entities:        row.entities as Bet['entities'],
    metrics:         row.metrics as Bet['metrics'] | undefined,
  };
}

// ── public API ───────────────────────────────────────────────

export async function fetchBets(): Promise<Bet[]> {
  if (!supabase) return MOCK_BETS;

  const { data, error } = await supabase
    .from('bets')
    .select('*')
    .order('placed_at', { ascending: false, nullsFirst: false })
    .order('id');

  if (error || !data?.length) {
    console.warn('[supabaseService] fetchBets fallback to constants:', error?.message);
    return MOCK_BETS;
  }

  return data.map(rowToBet);
}

export async function fetchLeagueHistory(): Promise<MonthlyStanding[]> {
  if (!supabase) return LEAGUE_HISTORY;

  const { data, error } = await supabase
    .from('league_history')
    .select('*')
    .order('id'); // insertion order preserves chronological sequence

  if (error || !data?.length) {
    console.warn('[supabaseService] fetchLeagueHistory fallback to constants:', error?.message);
    return LEAGUE_HISTORY;
  }

  return data.map((row) => ({
    month:  row.month as string,
    year:   row.year as string,
    scores: row.scores as MonthlyStanding['scores'],
  }));
}

export async function fetchLastUpdated(): Promise<string> {
  if (!supabase) return LAST_UPDATED;

  const { data, error } = await supabase
    .from('app_meta')
    .select('value')
    .eq('key', 'last_updated')
    .single();

  if (error || !data) {
    console.warn('[supabaseService] fetchLastUpdated fallback to constants:', error?.message);
    return LAST_UPDATED;
  }

  return data.value as string;
}

// ── admin mutations ───────────────────────────────────────────

function betToRow(bet: Partial<Bet>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (bet.slug            !== undefined) row.slug            = bet.slug;
  if (bet.title           !== undefined) row.title           = bet.title;
  if (bet.league          !== undefined) row.league          = bet.league;
  if (bet.season          !== undefined) row.season          = bet.season;
  if (bet.group           !== undefined) {
    row.group_kind = bet.group.kind;
    row.group_name = bet.group.name;
    row.group_slug = bet.group.slug;
  }
  if (bet.type            !== undefined) row.type            = bet.type;
  if (bet.criteria        !== undefined) row.criteria        = bet.criteria;
  if (bet.voidConditions  !== undefined) row.void_conditions = bet.voidConditions;
  if (bet.prize           !== undefined) row.prize           = bet.prize;
  if (bet.status          !== undefined) row.status          = bet.status;
  if (bet.result          !== undefined) row.result          = bet.result ?? null;
  if (bet.winners         !== undefined) row.winners         = bet.winners;
  if (bet.placedAt        !== undefined) row.placed_at       = bet.placedAt;
  if (bet.stake           !== undefined) row.stake           = bet.stake;
  if (bet.payout          !== undefined) row.payout          = bet.payout;
  if (bet.heroImage       !== undefined) row.hero_image      = bet.heroImage;
  if (bet.useCustomHero   !== undefined) row.use_custom_hero = bet.useCustomHero;
  if (bet.participants    !== undefined) row.participants    = bet.participants;
  if (bet.entities        !== undefined) row.entities        = bet.entities;
  if (bet.metrics         !== undefined) row.metrics         = bet.metrics;
  return row;
}

export async function updateBet(id: string, fields: Partial<Bet>): Promise<void> {
  const client = supabaseAdmin ?? supabase;
  if (!client) throw new Error('Supabase not configured');
  const { error } = await client.from('bets').update(betToRow(fields)).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function createBet(bet: Omit<Bet, 'id'>): Promise<Bet> {
  const client = supabaseAdmin ?? supabase;
  if (!client) throw new Error('Supabase not configured');
  const { data, error } = await client
    .from('bets')
    .insert(betToRow(bet))
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Failed to create bet');
  return rowToBet(data as Record<string, unknown>);
}
