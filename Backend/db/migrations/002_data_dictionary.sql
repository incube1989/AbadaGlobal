-- 002_data_dictionary.sql — self-documenting schema.
--
-- Every table/column should carry a COMMENT so the database is its own data
-- dictionary. The v_data_dictionary view renders those comments in a
-- queryable form.
--
-- Query it with:
--   SELECT * FROM v_data_dictionary ORDER BY "table", "column";
--   SELECT * FROM v_data_dictionary WHERE "table" = 'app_meta';

COMMENT ON TABLE app_meta IS
  'Key/value store for application metadata. Placeholder table demonstrating the migration and documentation pipeline.';

COMMENT ON COLUMN app_meta.key IS
  'Unique key identifying the metadata entry.';

COMMENT ON COLUMN app_meta.value IS
  'Value associated with the key.';

CREATE OR REPLACE VIEW v_data_dictionary AS
SELECT
  c.relname                                                            AS "table",
  a.attname                                                            AS "column",
  format_type(a.atttypid, a.atttypmod)                                 AS "type",
  NOT a.attnotnull                                                     AS "nullable",
  COALESCE(ic.column_default::text, '')                                AS "default",
  COALESCE(d.description, '')                                          AS "comment"
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_attribute a ON a.attrelid = c.oid
LEFT JOIN pg_description d
  ON d.objoid = c.oid AND d.objsubid = a.attnum
LEFT JOIN information_schema.columns ic
  ON ic.table_schema = n.nspname
 AND ic.table_name = c.relname
 AND ic.column_name = a.attname
WHERE c.relkind IN ('r', 'p', 'v')
  AND n.nspname NOT IN ('pg_catalog', 'information_schema')
  AND a.attnum > 0
  AND NOT a.attisdropped
ORDER BY c.relname, a.attnum;

COMMENT ON VIEW v_data_dictionary IS
  'Queryable data dictionary: every user table/view with its columns, types, and comments.';