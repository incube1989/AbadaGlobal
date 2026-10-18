-- 006_seed_version02.sql — version0.2 seed data.
--
-- * Migrate existing roles to the new 4-level vocabulary.
-- * Add the super admin account (password 1234, same scrypt hash as admin).
-- * Seed countries and regions.
-- * Re-point the 17 MVP events to country/region, set status and created_by.
-- * Add the super admin as owner of every seed event.
--
-- All statements are idempotent (ON CONFLICT / guarded updates).

-- Roles: old vocabulary -> new vocabulary --------------------------------

UPDATE users SET role = 'administrator' WHERE role = 'admin';
UPDATE users SET role = 'default'       WHERE role = 'simple user';

-- Super admin ------------------------------------------------------------

INSERT INTO users (email, password_hash, name, role)
VALUES (
  'superadmin@gmail.com',
  'df4079a602d5f1f40a6d9c3d2db9e31c7163d3451b0637eb845007d0707982ebbd1fa56fca0a74afbcc23b310407c44b3005b2d3f81e9cc1f5d277a04c36644d',
  'Super Admin',
  'super admin'
)
ON CONFLICT (email) DO NOTHING;

-- Countries --------------------------------------------------------------

INSERT INTO countries (name)
VALUES ('Russia'), ('Luxembourg'), ('Brazil')
ON CONFLICT (name) DO NOTHING;

-- Regions -----------------------------------------------------------------

INSERT INTO regions (name, country_id)
SELECT r.name, c.id
FROM (VALUES
  ('Samara',            'Russia'),
  ('Moscow Region',     'Russia'),
  ('Saint Petersburg',  'Russia'),
  ('Voronezh',          'Russia'),
  ('Yekaterinburg',     'Russia'),
  ('Moscow',            'Russia'),
  ('Rio de Janeiro',    'Brazil')
) AS r(name, country)
JOIN countries c ON c.name = r.country
ON CONFLICT (country_id, name) DO NOTHING;

-- Events: re-point to country/region, set status and created_by -----------
-- Jogos Mundiais keeps NULL country/region (venue TBD).

UPDATE events e SET
  country_id = c.id,
  region_id  = rg.id,
  status     = 'published',
  created_by = (SELECT id FROM users WHERE email = 'superadmin@gmail.com')
FROM (VALUES
  ('Capoeira na Beira do Volga',           '2026-10-23', 'Russia',    'Samara'),
  ('Competition',                          '2026-12-04', 'Russia',    'Voronezh'),
  ('Competition (Grds Magrinha, Soldado e equipe)', '2026-12-11', 'Russia', 'Saint Petersburg'),
  ('Festival Cultural (Prof. Tuka e equipe)', '2026-12-19', 'Russia', 'Saint Petersburg'),
  ('Open competition',                     '2027-02-20', 'Russia',    'Samara'),
  ('Batizado Integrado',                   '2027-03-12', 'Russia',    'Moscow Region'),
  ('Jogos Europeus (European Games)',      '2027-03-25', 'Luxembourg', NULL),
  ('Batizado (Grds Magrinha, Soldado e equipe)', '2027-04-02', 'Russia', 'Saint Petersburg'),
  ('Batizado',                             '2027-04-23', 'Russia',    'Voronezh'),
  ('Batizado (Prof. Tuka e equipe)',       '2027-04-30', 'Russia',    'Saint Petersburg'),
  ('Batizado',                             '2027-05-14', 'Russia',    'Samara'),
  ('Batizado',                             '2027-05-28', 'Russia',    'Yekaterinburg'),
  ('Competition',                          '2027-06-05', 'Russia',    'Moscow'),
  ('CapoWeekend 14+ and adults (Prof. Falcão, Grds Narrador e Cegonha)', '2027-06-24', 'Russia', 'Moscow Region'),
  ('Kids camp 7-13 y.o. (Prof. Falcão, Grds Narrador, Cegonha)', '2027-07-10', 'Russia', 'Moscow Region'),
  ('Jogos Mundiais (World Games 2027)',    '2027-08-01', NULL,        NULL),
  ('Zumbimba',                             '2027-11-01', 'Brazil',    'Rio de Janeiro')
) AS v(name, start_date, country, region)
LEFT JOIN countries c ON c.name = v.country
LEFT JOIN regions rg ON rg.name = v.region AND rg.country_id = c.id
WHERE e.name = v.name AND e.start_date = v.start_date::date;

-- created_by is now populated for every event -> make it NOT NULL ---------

ALTER TABLE events ALTER COLUMN created_by SET NOT NULL;

-- Owners: the super admin owns every seed event ---------------------------

INSERT INTO event_owners (event_id, user_id)
SELECT e.id, u.id
FROM events e
JOIN users u ON u.email = 'superadmin@gmail.com'
ON CONFLICT DO NOTHING;