-- 007_version03_domain.sql — version0.3 domain changes.
--
-- * persons: new `corda` column (capoeira belt, enum stays in Portuguese).
-- * person_curators: a person may have a list of curator persons (nullable).
-- * person_heads: a person may head a list of regions (nullable).
-- * event_guests: an event has a list of guest persons, shown at the top of
--   the event information (pop-up and event page).
--
-- Notes:
-- * The person `title` (Graduado / Instrutor / Professor / Mestre /
--   Grão Mestre) is NOT stored — it is derived from `corda` by the backend
--   (and frontend) and can never be set manually.
-- * Every object carries a COMMENT (database-as-data-dictionary convention).

-- persons.corda -----------------------------------------------------------

ALTER TABLE persons
  ADD COLUMN corda text NULL
  CHECK (corda IN (
    -- no title
    'crua', 'crua-amarela', 'amarela', 'amarela-laranja',
    'laranja', 'laranja-azul',
    -- graduado
    'azul', 'azul-verde', 'verde', 'verde-roxa',
    -- instrutor
    'roxa', 'roxa-marrom',
    -- professor
    'marrom', 'marrom-vermelha',
    -- mestre
    'vermelha-branco',
    -- grão mestre
    'branco'
  ));

COMMENT ON COLUMN persons.corda IS
  'Capoeira belt (corda), kept in Portuguese on purpose. NULL means the belt was not set yet. The title is derived from the corda and is never stored.';

-- person_curators ---------------------------------------------------------

CREATE TABLE IF NOT EXISTS person_curators (
  id         serial PRIMARY KEY,
  person_id  int NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  curator_id int NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  UNIQUE (person_id, curator_id),
  CHECK (person_id <> curator_id)
);

COMMENT ON TABLE person_curators IS
  'Curators of a person (list of persons); a person has no curators by default.';
COMMENT ON COLUMN person_curators.id IS 'Surrogate primary key.';
COMMENT ON COLUMN person_curators.person_id IS 'The person who has curators.';
COMMENT ON COLUMN person_curators.curator_id IS 'A curator person of the person.';

-- person_heads ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS person_heads (
  id        serial PRIMARY KEY,
  person_id int NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  region_id int NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  UNIQUE (person_id, region_id)
);

COMMENT ON TABLE person_heads IS
  'Regions headed by a person (list of regions); a person heads no regions by default.';
COMMENT ON COLUMN person_heads.id IS 'Surrogate primary key.';
COMMENT ON COLUMN person_heads.person_id IS 'The person who heads a region.';
COMMENT ON COLUMN person_heads.region_id IS 'A region headed by the person.';

-- event_guests ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS event_guests (
  id        serial PRIMARY KEY,
  event_id  int NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  person_id int NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  UNIQUE (event_id, person_id)
);

COMMENT ON TABLE event_guests IS
  'Guest list of an event (persons), shown at the top of the event information.';
COMMENT ON COLUMN event_guests.id IS 'Surrogate primary key.';
COMMENT ON COLUMN event_guests.event_id IS 'The event with guests.';
COMMENT ON COLUMN event_guests.person_id IS 'A guest person of the event.';