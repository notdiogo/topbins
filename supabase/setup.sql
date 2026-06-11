-- ============================================================
-- TopBins — bring an existing database up to date.
-- Idempotent: safe to run (and re-run) in Supabase → SQL Editor.
-- Fixes "Could not find the 'group_kind' column of 'bets'" by adding the
-- missing columns/tables and reloading the PostgREST schema cache.
-- ============================================================

-- 1) bets: grouping + recorded outcome + groundwork columns -----------
alter table public.bets
  add column if not exists group_kind text not null default 'CLUB_SEASON'
    check (group_kind in ('CLUB_SEASON', 'INTERNATIONAL_TOURNAMENT')),
  add column if not exists group_name text not null default '',
  add column if not exists group_slug text not null default '',
  add column if not exists result text
    check (result is null or result in ('SIDE_A', 'SIDE_B', 'PUSH', 'VOID')),
  add column if not exists winners jsonb not null default '[]',
  add column if not exists placed_at timestamptz,
  add column if not exists stake numeric,
  add column if not exists payout numeric;

create index if not exists bets_group_slug_idx on public.bets (group_slug);

-- Admin-created bets don't supply an id, so give the column a default.
alter table public.bets alter column id set default gen_random_uuid()::text;

-- Backfill any legacy rows that predate grouping.
update public.bets
  set group_kind = 'CLUB_SEASON', group_name = 'EPL 25/26', group_slug = 'epl-25-26'
  where coalesce(group_slug, '') = '';

-- 2) World Cup prediction categories ----------------------------------
create table if not exists public.prediction_categories (
  id             text primary key default gen_random_uuid()::text,
  group_slug     text not null,
  name           text not null,
  details        text not null default '',
  order_index    integer not null default 0,
  picks          jsonb not null default '{}',
  correct_answer text,
  status         text not null default 'OPEN'
                   check (status in ('OPEN', 'SETTLED', 'VOID')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists prediction_categories_group_slug_idx
  on public.prediction_categories (group_slug);

-- 3) World Cup brackets: teams, per-person entries, actual results -----
create table if not exists public.bracket_teams (
  id           text primary key,
  name         text not null,
  code         text not null,
  group_letter text not null
);
create index if not exists bracket_teams_group_idx on public.bracket_teams (group_letter);

create table if not exists public.bracket_entries (
  id           text primary key,
  participant  text not null unique,
  group_orders jsonb not null default '{}',
  knockout     jsonb not null default '{}',
  updated_at   timestamptz not null default now()
);

create table if not exists public.bracket_actual (
  id           text primary key default 'actual',
  group_orders jsonb not null default '{}',
  knockout     jsonb not null default '{}',
  updated_at   timestamptz not null default now()
);

-- 4) Row level security: public read (writes use the service-role key) -
alter table public.prediction_categories enable row level security;
alter table public.bracket_teams          enable row level security;
alter table public.bracket_entries        enable row level security;
alter table public.bracket_actual         enable row level security;

drop policy if exists "Public read predictions" on public.prediction_categories;
drop policy if exists "Public read teams"       on public.bracket_teams;
drop policy if exists "Public read entries"     on public.bracket_entries;
drop policy if exists "Public read actual"      on public.bracket_actual;
create policy "Public read predictions" on public.prediction_categories for select using (true);
create policy "Public read teams"       on public.bracket_teams          for select using (true);
create policy "Public read entries"     on public.bracket_entries        for select using (true);
create policy "Public read actual"      on public.bracket_actual         for select using (true);

-- 5) Reload the PostgREST schema cache so new columns are picked up ----
notify pgrst, 'reload schema';
