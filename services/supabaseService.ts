/**
 * Data fetching service — reads from Supabase when credentials are
 * configured, silently falls back to the local constants otherwise.
 *
 * This means the app continues to work in dev without any .env.local
 * values set.  Once VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are
 * added, all three functions will pull live data automatically.
 */

import { supabase } from '../lib/supabase';
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
    type:            row.type as Bet['type'],
    criteria:        row.criteria as string,
    voidConditions:  row.void_conditions as string,
    prize:           row.prize as string,
    status:          row.status as Bet['status'],
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
