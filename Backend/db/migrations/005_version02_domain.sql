-- 005_version02_domain.sql — version0.2 domain changes.
--
-- * users: new 4-level role vocabulary (default | moderator | administrator |
--   super admin) and an is_banned flag.
-- * countries / regions / persons: moderation entities with soft-delete.
-- * events: the text `place` column is replaced by country_id + region_id;
--   status (draft | published | deleted) and created_by are added.
-- * event_owners: polymorphic owner list (a user OR a person per row).
--
-- Every object carries a COMMENT (database-as-data-dictionary convention).

-- users -----------------------------------------------------------------

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Migrate existing role values to the new vocabulary BEFORE enforcing the new
-- CHECK constraint (the seed migration 006 also repeats these for freshness).
UPDATE users SET role = 'administrator' WHERE role = 'admin';
UPDATE users SET role = 'default'       WHERE role = 'simple user';

ALTER TABLE users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('default', 'moderator', 'administrator', 'super admin'));

ALTER TABLE users
  ADD COLUMN is_banned boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN users.role IS
  'Rights level: default, moderator, administrator, or super admin. Super admin cannot be stripped of rights; at least one super admin must always exist.';
COMMENT ON COLUMN users.is_banned IS
  'Banned users cannot log in; the login page shows a banned error.';

-- countries -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS countries (
  id         serial PRIMARY KEY,
  name       text NOT NULL UNIQUE,
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE countries IS
  'Countries managed on the moderation page; referenced by regions, persons, and events.';
COMMENT ON COLUMN countries.id IS 'Surrogate primary key.';
COMMENT ON COLUMN countries.name IS 'Country name (unique).';
COMMENT ON COLUMN countries.is_deleted IS 'Soft-delete flag (mark as deleted).';
COMMENT ON COLUMN countries.created_at IS 'Timestamp when the row was created.';

-- regions ---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS regions (
  id         serial PRIMARY KEY,
  name       text NOT NULL,
  country_id int NOT NULL REFERENCES countries(id),
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (country_id, name)
);

COMMENT ON TABLE regions IS
  'Regions within a country, managed on the moderation page; referenced by events.';
COMMENT ON COLUMN regions.id IS 'Surrogate primary key.';
COMMENT ON COLUMN regions.name IS 'Region name (unique within a country).';
COMMENT ON COLUMN regions.country_id IS 'Owning country.';
COMMENT ON COLUMN regions.is_deleted IS 'Soft-delete flag (mark as deleted).';
COMMENT ON COLUMN regions.created_at IS 'Timestamp when the row was created.';

-- persons ---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS persons (
  id         serial PRIMARY KEY,
  nickname   text NOT NULL,
  country_id int NOT NULL REFERENCES countries(id),
  user_id    int NULL UNIQUE REFERENCES users(id),
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (country_id, nickname)
);

COMMENT ON TABLE persons IS
  'Real people in the school, identified by country + nickname (apelido). A person may be linked to at most one user; a person can exist without a user and vice versa.';
COMMENT ON COLUMN persons.id IS 'Surrogate primary key.';
COMMENT ON COLUMN persons.nickname IS 'Nickname (apelido) of the person.';
COMMENT ON COLUMN persons.country_id IS 'Country of the person.';
COMMENT ON COLUMN persons.user_id IS 'Optional link to the user account of this person (unique).';
COMMENT ON COLUMN persons.is_deleted IS 'Soft-delete flag (mark as deleted).';
COMMENT ON COLUMN persons.created_at IS 'Timestamp when the row was created.';

-- events -----------------------------------------------------------------

ALTER TABLE events DROP COLUMN IF EXISTS place;

ALTER TABLE events
  ADD COLUMN country_id int NULL REFERENCES countries(id),
  ADD COLUMN region_id  int NULL REFERENCES regions(id),
  ADD COLUMN status     text NOT NULL DEFAULT 'published'
                        CHECK (status IN ('draft', 'published', 'deleted')),
  ADD COLUMN created_by int NULL REFERENCES users(id);

COMMENT ON COLUMN events.country_id IS
  'Country of the event (nullable while the venue is TBD).';
COMMENT ON COLUMN events.region_id IS
  'Region of the event within the country (nullable).';
COMMENT ON COLUMN events.status IS
  'Lifecycle status: draft, published, or deleted (soft delete).';
COMMENT ON COLUMN events.created_by IS
  'User who created the event. Set NOT NULL by the seed migration once all rows are populated.';

-- event_owners -----------------------------------------------------------

CREATE TABLE IF NOT EXISTS event_owners (
  id        serial PRIMARY KEY,
  event_id  int NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id   int NULL REFERENCES users(id),
  person_id int NULL REFERENCES persons(id),
  CHECK ((user_id IS NOT NULL)::int + (person_id IS NOT NULL)::int = 1)
);

CREATE UNIQUE INDEX IF NOT EXISTS event_owners_user_idx
  ON event_owners (event_id, user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS event_owners_person_idx
  ON event_owners (event_id, person_id) WHERE person_id IS NOT NULL;

COMMENT ON TABLE event_owners IS
  'Owner list of an event: users and/or persons. The creator is added automatically and may remove themselves.';
COMMENT ON COLUMN event_owners.id IS 'Surrogate primary key.';
COMMENT ON COLUMN event_owners.event_id IS 'The owned event.';
COMMENT ON COLUMN event_owners.user_id IS 'Owner user (exactly one of user_id/person_id is set).';
COMMENT ON COLUMN event_owners.person_id IS 'Owner person (exactly one of user_id/person_id is set).';