-- ============================================================
-- 003 — World Cup brackets: teams, per-person entries, actual results
-- ============================================================

create table if not exists public.bracket_teams (
  id           text primary key,         -- e.g. 'fra'
  name         text not null,
  code         text not null,
  group_letter text not null             -- 'A'..'L'
);
create index if not exists bracket_teams_group_idx on public.bracket_teams (group_letter);

-- One row per participant (Diogo / Mitch / Shiv).
create table if not exists public.bracket_entries (
  id           text primary key,
  participant  text not null unique,
  group_orders jsonb not null default '{}',   -- group -> [teamId x4]
  knockout     jsonb not null default '{}',   -- matchId -> teamId
  updated_at   timestamptz not null default now()
);

-- Single row of real results (id = 'actual').
create table if not exists public.bracket_actual (
  id           text primary key default 'actual',
  group_orders jsonb not null default '{}',
  knockout     jsonb not null default '{}',
  updated_at   timestamptz not null default now()
);

alter table public.bracket_teams   enable row level security;
alter table public.bracket_entries enable row level security;
alter table public.bracket_actual  enable row level security;

drop policy if exists "Public read teams"   on public.bracket_teams;
drop policy if exists "Public read entries" on public.bracket_entries;
drop policy if exists "Public read actual"  on public.bracket_actual;
create policy "Public read teams"   on public.bracket_teams   for select using (true);
create policy "Public read entries" on public.bracket_entries for select using (true);
create policy "Public read actual"  on public.bracket_actual  for select using (true);
