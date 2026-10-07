-- 001_init.sql — initial schema.
--
-- Placeholder table demonstrating the migration pipeline.
-- Replace with real domain tables as the project evolves.

CREATE TABLE IF NOT EXISTS app_meta (
  key   text PRIMARY KEY,
  value text NOT NULL
);