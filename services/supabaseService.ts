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
import { Bet, MonthlyStanding, PredictionCategory, WCTeam, BracketEntry, BracketActual } from '../types';
import {
  MOCK_BETS, LEAGUE_HISTORY, LAST_UPDATED, MOCK_PREDICTIONS,
  MOCK_TEAMS, MOCK_BRACKET_ENTRIES, MOCK_BRACKET_ACTUAL,
} from '../constants';

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

// ── predictions ───────────────────────────────────────────────

function rowToPrediction(row: Record<string, unknown>): PredictionCategory {
  return {
    id:            row.id as string,
    groupSlug:     row.group_slug as string,
    name:          row.name as string,
    details:       (row.details as string) ?? '',
    order:         (row.order_index as number) ?? 0,
    picks:         (row.picks as Record<string, string> | null) ?? {},
    correctAnswer: (row.correct_answer as string | null) ?? undefined,
    status:        (row.status as PredictionCategory['status']) ?? 'OPEN',
  };
}

function predictionToRow(p: Partial<PredictionCategory>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (p.groupSlug     !== undefined) row.group_slug     = p.groupSlug;
  if (p.name          !== undefined) row.name           = p.name;
  if (p.details       !== undefined) row.details        = p.details;
  if (p.order         !== undefined) row.order_index    = p.order;
  if (p.picks         !== undefined) row.picks          = p.picks;
  if (p.correctAnswer !== undefined) row.correct_answer = p.correctAnswer ?? null;
  if (p.status        !== undefined) row.status         = p.status;
  return row;
}

export async function fetchPredictions(): Promise<PredictionCategory[]> {
  if (!supabase) return MOCK_PREDICTIONS;

  const { data, error } = await supabase
    .from('prediction_categories')
    .select('*')
    .order('order_index');

  if (error || !data?.length) {
    console.warn('[supabaseService] fetchPredictions fallback to constants:', error?.message);
    return MOCK_PREDICTIONS;
  }
  return data.map(rowToPrediction);
}

export async function updatePrediction(id: string, fields: Partial<PredictionCategory>): Promise<void> {
  const client = supabaseAdmin ?? supabase;
  if (!client) throw new Error('Supabase not configured');
  const { error } = await client.from('prediction_categories').update(predictionToRow(fields)).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function createPrediction(p: Omit<PredictionCategory, 'id'>): Promise<PredictionCategory> {
  const client = supabaseAdmin ?? supabase;
  if (!client) throw new Error('Supabase not configured');
  const { data, error } = await client
    .from('prediction_categories')
    .insert(predictionToRow(p))
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Failed to create prediction');
  return rowToPrediction(data as Record<string, unknown>);
}

// ── world cup brackets ────────────────────────────────────────

export async function fetchTeams(): Promise<WCTeam[]> {
  if (!supabase) return MOCK_TEAMS;
  const { data, error } = await supabase.from('bracket_teams').select('*').order('group_letter');
  if (error || !data?.length) {
    console.warn('[supabaseService] fetchTeams fallback to constants:', error?.message);
    return MOCK_TEAMS;
  }
  return data.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    code: row.code as string,
    group: row.group_letter as string,
  }));
}

export async function fetchBracketEntries(): Promise<BracketEntry[]> {
  if (!supabase) return MOCK_BRACKET_ENTRIES;
  const { data, error } = await supabase.from('bracket_entries').select('*');
  if (error || !data?.length) {
    console.warn('[supabaseService] fetchBracketEntries fallback to constants:', error?.message);
    return MOCK_BRACKET_ENTRIES;
  }
  return data.map((row) => ({
    id: row.id as string,
    participant: row.participant as string,
    groupOrders: (row.group_orders as Record<string, string[]>) ?? {},
    knockout: (row.knockout as Record<string, string>) ?? {},
  }));
}

export async function fetchBracketActual(): Promise<BracketActual> {
  if (!supabase) return MOCK_BRACKET_ACTUAL;
  const { data, error } = await supabase.from('bracket_actual').select('*').eq('id', 'actual').single();
  if (error || !data) {
    console.warn('[supabaseService] fetchBracketActual fallback to constants:', error?.message);
    return MOCK_BRACKET_ACTUAL;
  }
  return {
    groupOrders: (data.group_orders as Record<string, string[]>) ?? {},
    knockout: (data.knockout as Record<string, string>) ?? {},
  };
}

export async function saveBracketEntry(entry: BracketEntry): Promise<void> {
  const client = supabaseAdmin ?? supabase;
  if (!client) throw new Error('Supabase not configured');
  const { error } = await client.from('bracket_entries').upsert({
    id: entry.id,
    participant: entry.participant,
    group_orders: entry.groupOrders,
    knockout: entry.knockout,
  });
  if (error) throw new Error(error.message);
}

export async function saveBracketActual(actual: BracketActual): Promise<void> {
  const client = supabaseAdmin ?? supabase;
  if (!client) throw new Error('Supabase not configured');
  const { error } = await client.from('bracket_actual').upsert({
    id: 'actual',
    group_orders: actual.groupOrders,
    knockout: actual.knockout,
  });
  if (error) throw new Error(error.message);
}

export async function saveTeam(team: WCTeam): Promise<void> {
  const client = supabaseAdmin ?? supabase;
  if (!client) throw new Error('Supabase not configured');
  const { error } = await client.from('bracket_teams').upsert({
    id: team.id,
    name: team.name,
    code: team.code,
    group_letter: team.group,
  });
  if (error) throw new Error(error.message);
}
