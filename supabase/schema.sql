-- ============================================================
-- TopBins Database Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── bets ────────────────────────────────────────────────────
-- Stores bet definitions and live metrics (updated daily by
-- the Python scraper via the service-role key).
create table if not exists public.bets (
  id              text primary key,
  slug            text unique not null,
  title           text not null,
  league          text not null,
  season          text not null,
  type            text not null
                    check (type in ('PLAYER_VS_PLAYER', 'PLAYER_THRESHOLD', 'TEAM_VS_TEAM')),
  criteria        text not null,
  void_conditions text not null,
  prize           text not null,
  status          text not null default 'ACTIVE'
                    check (status in ('ACTIVE', 'PENDING', 'SETTLED', 'VOID')),
  hero_image      text not null,
  use_custom_hero boolean not null default false,
  -- Nested arrays stored as JSON (rarely change shape)
  participants    jsonb not null default '[]',
  entities        jsonb not null default '[]',
  -- Live stats updated by the scraper
  metrics         jsonb,
  updated_at      timestamptz not null default now()
);

-- Auto-refresh updated_at on any row change
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger bets_updated_at
  before update on public.bets
  for each row execute function public.set_updated_at();

-- ── league_history ───────────────────────────────────────────
-- Monthly leaderboard standings appended by the scraper each month.
create table if not exists public.league_history (
  id         serial primary key,
  month      text not null,           -- 'JAN', 'FEB', etc.
  year       text not null,           -- '2025', '2026', etc.
  scores     jsonb not null default '{}', -- { "Diogo": 3, "Shiv": 1, "Mitch": 2 }
  created_at timestamptz not null default now(),
  unique (month, year)
);

-- ── app_meta ─────────────────────────────────────────────────
-- Simple key/value store for metadata (e.g. last_updated timestamp).
create table if not exists public.app_meta (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);

create trigger app_meta_updated_at
  before update on public.app_meta
  for each row execute function public.set_updated_at();

-- ── Row Level Security ───────────────────────────────────────
-- Public read access for all three tables.
-- Only the service-role key (used server-side) can write.

alter table public.bets enable row level security;
alter table public.league_history enable row level security;
alter table public.app_meta enable row level security;

create policy "Public read access" on public.bets
  for select using (true);

create policy "Public read access" on public.league_history
  for select using (true);

create policy "Public read access" on public.app_meta
  for select using (true);
