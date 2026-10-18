-- 004_seed_mvp.sql — MVP seed data.
--
-- Two fixed users (from MVPscope) and the normalized 2026-2027 hardcoded
-- event list (Design/wiki/sources/hardcoded-events.md).
--
-- Passwords are stored as scrypt digests (Node crypto.scryptSync, salt
-- 'abadaglobal-mvp-salt', 64-byte hex) — the app compares logins with the
-- same parameters. Hashes were precomputed from the seed passwords:
--   1234 -> df4079a6...c36644d
--   4321 -> 80e35d47...91af4c
--
-- Both inserts are idempotent thanks to the UNIQUE constraints
-- (users.email, events(name, start_date)).

INSERT INTO users (email, password_hash, name, role)
VALUES
  (
    'admin@gmail.com',
    'df4079a602d5f1f40a6d9c3d2db9e31c7163d3451b0637eb845007d0707982ebbd1fa56fca0a74afbcc23b310407c44b3005b2d3f81e9cc1f5d277a04c36644d',
    'Admin',
    'admin'
  ),
  (
    'user@gmail.com',
    '80e35d476a2c8663932283d1bcb7e8a1cdf39a1d1847b0023bb5388a000d99ed65a30abcdb1653e6ebcbdb2137c65e55af762071b891324e361763e63891af4c',
    'User',
    'simple user'
  )
ON CONFLICT (email) DO NOTHING;

-- The 17 normalized events.
-- Seed notes (deviations from the source are documented inline):
--   * Capoeira na Beira do Volga scope inferred -> local (source marked it *)
--   * Festival Cultural scope not stated in the source -> region
--   * Kids camp venue not stated -> Moscow Region (same as CapoWeekend)
--   * Jogos Mundiais dates/city TBD -> month-wide range 2027-08-01..31, place TBD
--   * Zumbimba runs the whole month of November -> 2027-11-01..30
INSERT INTO events (name, start_date, end_date, place, type, scope)
VALUES
  ('Capoeira na Beira do Volga',           '2026-10-23', '2026-10-25', 'Samara',           'festival',    'local'),
  ('Competition',                          '2026-12-04', '2026-12-06', 'Voronezh',         'competition', 'Russia'),
  ('Competition (Grds Magrinha, Soldado e equipe)', '2026-12-11', '2026-12-13', 'Saint Petersburg', 'competition', 'Russia'),
  ('Festival Cultural (Prof. Tuka e equipe)', '2026-12-19', '2026-12-20', 'Saint Petersburg', 'festival', 'region'),
  ('Open competition',                     '2027-02-20', '2027-02-22', 'Samara',           'competition', 'Russia'),
  ('Batizado Integrado',                   '2027-03-12', '2027-03-14', 'Moscow Region',    'batizado',     'region'),
  ('Jogos Europeus (European Games)',      '2027-03-25', '2027-03-29', 'Luxembourg',       'competition', 'world'),
  ('Batizado (Grds Magrinha, Soldado e equipe)', '2027-04-02', '2027-04-04', 'Saint Petersburg', 'batizado', 'region'),
  ('Batizado',                             '2027-04-23', '2027-04-25', 'Voronezh',         'batizado',     'region'),
  ('Batizado (Prof. Tuka e equipe)',       '2027-04-30', '2027-05-02', 'Saint Petersburg', 'batizado',     'region'),
  ('Batizado',                             '2027-05-14', '2027-05-16', 'Samara',           'batizado',     'region'),
  ('Batizado',                             '2027-05-28', '2027-05-30', 'Yekaterinburg',    'batizado',     'region'),
  ('Competition',                          '2027-06-05', '2027-06-06', 'Moscow',           'competition', 'Russia'),
  ('CapoWeekend 14+ and adults (Prof. Falcão, Grds Narrador e Cegonha)', '2027-06-24', '2027-06-27', 'Moscow Region', 'camp', 'region'),
  ('Kids camp 7-13 y.o. (Prof. Falcão, Grds Narrador, Cegonha)', '2027-07-10', '2027-07-24', 'Moscow Region', 'camp', 'region'),
  ('Jogos Mundiais (World Games 2027)',    '2027-08-01', '2027-08-31', 'TBD',              'competition', 'world'),
  ('Zumbimba',                             '2027-11-01', '2027-11-30', 'Rio de Janeiro',   'batizado',     'world')
ON CONFLICT (name, start_date) DO NOTHING;