-- ============================================================
-- 002 — World Cup prediction categories
-- Each row is a category (e.g. "Golden Boot") with one pick per
-- person (jsonb name->answer) and an admin-set correct answer.
-- ============================================================

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

alter table public.prediction_categories enable row level security;

-- Public read; writes go through the service-role key (admin).
drop policy if exists "Public read predictions" on public.prediction_categories;
create policy "Public read predictions"
  on public.prediction_categories for select using (true);
