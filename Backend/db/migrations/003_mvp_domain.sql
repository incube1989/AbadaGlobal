-- 003_mvp_domain.sql — MVP domain tables: users and events.
--
-- users    — email + password login (password_hash is an scrypt digest,
--             see 004_seed_mvp.sql for the fixed MVP accounts).
-- events   — the hardcoded calendar dataset served by the MVP.
-- Every object carries a COMMENT (database-as-data-dictionary convention).

CREATE TABLE IF NOT EXISTS users (
  id            serial PRIMARY KEY,
  email         text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  name          text NOT NULL,
  role          text NOT NULL
                CHECK (role IN ('admin', 'moderator', 'simple user')),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id         serial PRIMARY KEY,
  name       text NOT NULL,
  start_date date NOT NULL,
  end_date   date NOT NULL,
  place      text NOT NULL,
  type       text NOT NULL
             CHECK (type IN ('competition', 'festival', 'batizado', 'camp', 'coach only')),
  scope      text NOT NULL
             CHECK (scope IN ('world', 'Russia', 'region', 'local')),
  -- Makes the seed data idempotent: the same event name + start date may be
  -- inserted only once.
  UNIQUE (name, start_date)
);

COMMENT ON TABLE users IS
  'MVP accounts. All roles (admin, moderator, simple user) have equal rights in the MVP — only the logged-in state matters.';

COMMENT ON COLUMN users.id IS
  'Surrogate primary key.';

COMMENT ON COLUMN users.email IS
  'Unique login email.';

COMMENT ON COLUMN users.password_hash IS
  'scrypt digest of the password (salt: abadaglobal-mvp-salt), 64-byte hex.';

COMMENT ON COLUMN users.name IS
  'Display name of the user.';

COMMENT ON COLUMN users.role IS
  'Role: admin, moderator, or simple user. All equal in the MVP.';

COMMENT ON COLUMN users.created_at IS
  'Timestamp when the account was created.';

COMMENT ON TABLE events IS
  'Calendar events for the MVP. Data comes from the hardcoded 2026-2027 seed list; CRUD is deferred post-MVP.';

COMMENT ON COLUMN events.id IS
  'Surrogate primary key.';

COMMENT ON COLUMN events.name IS
  'Event name as shown on the calendar panel.';

COMMENT ON COLUMN events.start_date IS
  'First day of the event (inclusive).';

COMMENT ON COLUMN events.end_date IS
  'Last day of the event (inclusive).';

COMMENT ON COLUMN events.place IS
  'Standardized English place name; TBD where the source gives no venue.';

COMMENT ON COLUMN events.type IS
  'Event type: competition, festival, batizado, camp, coach only.';

COMMENT ON COLUMN events.scope IS
  'Event scope driving the calendar panel color: world (red), Russia (blue), region (green), local (yellow).';