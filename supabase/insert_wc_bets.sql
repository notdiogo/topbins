-- ============================================================
-- World Cup 2026 Bets
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

insert into public.bets (id, slug, title, league, season, type, criteria, void_conditions, prize, status, hero_image, use_custom_hero, participants, entities, metrics, group_kind, group_name, group_slug)
values
  (
    'bet_wc_03',
    'ronaldo-goals-threshold',
    'Ronaldo — 4 Goal Contributions',
    'World Cup',
    '2026',
    'PLAYER_THRESHOLD',
    'Cristiano Ronaldo to reach 4 or more goal contributions (goals + 0.5 per assist) at the World Cup 2026. Penalty shootout goals and assists do not count.',
    'Void if Portugal fail to qualify or if Ronaldo is ruled out before the tournament begins.',
    'Prize to be decided.',
    'ACTIVE',
    'https://picsum.photos/seed/ronaldo-wc/1200/800',
    true,
    '[{"name":"Shiv","side":"A"},{"name":"Diogo","side":"B"}]',
    '[{"name":"Cristiano Ronaldo","type":"PLAYER","side":"A","image":"/ronaldo-avatar.jpg"}]',
    '{"label":"Goal contributions","valueA":0,"valueB":0}',
    'INTERNATIONAL_TOURNAMENT',
    'World Cup 2026',
    'world-cup-2026'
  ),
  (
    'bet_wc_04',
    'ronaldo-vs-messi-goal-contributions',
    'Ronaldo vs Messi — Goal Contributions',
    'World Cup',
    '2026',
    'PLAYER_VS_PLAYER',
    'Who finishes the World Cup 2026 with more total goal contributions (goals + assists). Penalty shootout goals and assists do not count.',
    'Void if either player does not participate. If one nation is eliminated early through no fault of the player, the bet still stands.',
    'Prize to be decided.',
    'ACTIVE',
    'https://picsum.photos/seed/ronaldo-messi/1200/800',
    true,
    '[{"name":"Shiv","side":"A"},{"name":"Mitch","side":"B"}]',
    '[{"name":"Cristiano Ronaldo","type":"PLAYER","side":"A","image":"/ronaldo-avatar.jpg"},{"name":"Lionel Messi","type":"PLAYER","side":"B","image":"/messi-avatar.jpg"}]',
    '{"label":"Goal contributions","valueA":0,"valueB":0}',
    'INTERNATIONAL_TOURNAMENT',
    'World Cup 2026',
    'world-cup-2026'
  )
on conflict (id) do update set
  title           = excluded.title,
  criteria        = excluded.criteria,
  void_conditions = excluded.void_conditions,
  prize           = excluded.prize,
  participants    = excluded.participants,
  entities        = excluded.entities,
  metrics         = excluded.metrics,
  updated_at      = now();
