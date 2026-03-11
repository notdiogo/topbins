-- ============================================================
-- TopBins Seed Data
-- Run AFTER schema.sql in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── bets ────────────────────────────────────────────────────
insert into public.bets (id, slug, title, league, season, type, criteria, void_conditions, prize, status, hero_image, use_custom_hero, participants, entities, metrics)
values
  (
    'bet_01',
    'odegaard-vs-bruno',
    'Odegaard vs Bruno',
    'EPL',
    '2025-2026',
    'PLAYER_VS_PLAYER',
    'Straight comparison of total assists in the Premier League.',
    'Bet void if one player accumulates 2 months more injury time than the other.',
    'Winner receives one jersey or teamwear item.',
    'ACTIVE',
    '/martin-bruno.png',
    true,
    '[{"name":"Mitch","side":"A"},{"name":"Shiv","side":"B"}]',
    '[{"name":"Martin Odegaard","type":"PLAYER","side":"A","image":"/Martin-avatar.png"},{"name":"Bruno Fernandes","type":"PLAYER","side":"B","image":"/Bruno-avatar.png"}]',
    '{"label":"Assists","valueA":4,"valueB":12}'
  ),
  (
    'bet_02',
    'zirkzee-vs-madueke',
    'Zirkzee vs Madueke',
    'EPL + FA CUP + CARABAO',
    '2025-2026',
    'PLAYER_VS_PLAYER',
    'Most combined Goals + Assists (G/A) across EPL, Carabao Cup, and FA Cup. Minutes played are ignored.',
    'Bet void if one player accumulates 2 months more injury time than the other.',
    'Prize to be decided.',
    'ACTIVE',
    '/noni-zirk.png',
    true,
    '[{"name":"Shiv","side":"A"},{"name":"Mitch","side":"B"}]',
    '[{"name":"Joshua Zirkzee","type":"PLAYER","side":"A","image":"/Zirkzee-avatar.png"},{"name":"Noni Madueke","type":"PLAYER","side":"B","image":"/Noni-avatar.png"}]',
    '{"label":"G/A (All Comps)","valueA":3,"valueB":3}'
  ),
  (
    'bet_03',
    'zirkzee-vs-cherki',
    'Zirkzee vs Cherki',
    'EPL + FA CUP + CARABAO',
    '2025-2026',
    'PLAYER_VS_PLAYER',
    'Most combined Goals + Assists (G/A) across EPL, Carabao Cup, and FA Cup. Minutes played are ignored.',
    'Bet void if one player suffers two months more injury than the other.',
    'Shiv owes one espresso bean coffee bag. Diogo owes one sleeve of Nespresso pods.',
    'ACTIVE',
    '/zirk-chirk.png',
    true,
    '[{"name":"Shiv","side":"A"},{"name":"Diogo","side":"B"}]',
    '[{"name":"Joshua Zirkzee","type":"PLAYER","side":"A","image":"/Zirkzee-avatar.png"},{"name":"Rayan Cherki","type":"PLAYER","side":"B","image":"/Cherki-avatar.png"}]',
    '{"label":"G/A (All Comps)","valueA":3,"valueB":10}'
  ),
  (
    'bet_04',
    'frimpong-vs-nunes',
    'Frimpong vs Nunes',
    'EPL',
    '2025-2026',
    'PLAYER_VS_PLAYER',
    'Highest average FotMob rating across the season. Minimum 25 matches played required.',
    'If either player finishes the season with fewer than 25 matches played.',
    'Prize to be decided.',
    'ACTIVE',
    '/frimpong-nunes.png',
    true,
    '[{"name":"Shiv","side":"A"},{"name":"Diogo","side":"B"}]',
    '[{"name":"Jeremie Frimpong","type":"PLAYER","side":"A","image":"/Frimpong-avatar.png"},{"name":"Matheus Nunes","type":"PLAYER","side":"B","image":"/Nunes-avatar.png"}]',
    '{"label":"Avg Rating","valueA":6.8,"valueB":7.4}'
  ),
  (
    'bet_05',
    'cunha-threshold',
    'Matheus Cunha Target',
    'EPL',
    '2025-2026',
    'PLAYER_THRESHOLD',
    'Reach 20 Non-Penalty Goals + Assists (G/A) in the Premier League.',
    'Void if Cunha suffers two injuries totaling 12+ weeks.',
    'Pack of 12 golf balls (Titleist Pro V1 equivalent).',
    'ACTIVE',
    '/cunha-large.png',
    false,
    '[{"name":"Shiv","side":"A"},{"name":"Diogo","side":"B"},{"name":"Mitch","side":"B"}]',
    '[{"name":"Matheus Cunha","type":"PLAYER","side":"A","image":"/Cunha-avatar.png"}]',
    '{"label":"Non-Pen G/A","valueA":8,"target":20}'
  ),
  (
    'bet_06',
    'man-utd-vs-liverpool',
    'Liverpool vs Man Utd',
    'EPL',
    '2025-2026',
    'TEAM_VS_TEAM',
    'Who finishes higher in EPL standings.',
    'Standard rules apply.',
    'Mitch owes Shiv a shoe bag. Shiv does a 90s cold plunge (full body immersion).',
    'ACTIVE',
    '/liverpoolvsunited.png',
    true,
    '[{"name":"Mitch","side":"A"},{"name":"Shiv","side":"B"}]',
    '[{"name":"Liverpool","type":"TEAM","side":"A","image":"/Liverpool.png"},{"name":"Manchester United","type":"TEAM","side":"B","image":"/United.png"}]',
    '{"label":"League Position","valueA":6,"valueB":4,"isInverse":true,"maxValue":20}'
  )
on conflict (id) do update set
  metrics    = excluded.metrics,
  updated_at = now();

-- ── league_history ───────────────────────────────────────────
insert into public.league_history (month, year, scores)
values
  ('OCT', '2025', '{"Diogo":3,"Shiv":1,"Mitch":2}'),
  ('NOV', '2025', '{"Diogo":3,"Shiv":2,"Mitch":1}'),
  ('JAN', '2026', '{"Diogo":3,"Shiv":1,"Mitch":3}'),
  ('FEB', '2026', '{"Diogo":3,"Shiv":2,"Mitch":1}')
on conflict (month, year) do update set
  scores = excluded.scores;

-- ── app_meta ─────────────────────────────────────────────────
insert into public.app_meta (key, value)
values
  ('last_updated', 'Fri Feb 13, 9:13 AM EST')
on conflict (key) do update set
  value      = excluded.value,
  updated_at = now();
