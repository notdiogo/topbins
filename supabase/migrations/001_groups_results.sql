-- ============================================================
-- TopBins migration 001 — structured groups + recorded outcomes
-- Run in: Supabase Dashboard → SQL Editor (idempotent).
-- ============================================================

alter table public.bets
  add column if not exists group_kind text not null default 'CLUB_SEASON'
    check (group_kind in ('CLUB_SEASON','INTERNATIONAL_TOURNAMENT')),
  add column if not exists group_name text not null default '',
  add column if not exists group_slug text not null default '',
  add column if not exists result text
    check (result is null or result in ('SIDE_A','SIDE_B','PUSH','VOID')),
  add column if not exists winners jsonb not null default '[]',
  add column if not exists placed_at timestamptz,
  add column if not exists stake numeric,
  add column if not exists payout numeric;

create index if not exists bets_group_slug_idx on public.bets (group_slug);

-- Backfill: every existing bet is the EPL 25/26 club season.
-- (seed.sql's `on conflict do update` only touches metrics, so backfill here.)
update public.bets set
  group_kind = 'CLUB_SEASON',
  group_name = 'EPL 25/26',
  group_slug = 'epl-25-26',
  placed_at  = coalesce(placed_at, '2025-08-15'::timestamptz)
where group_slug = '' or group_slug is null;
