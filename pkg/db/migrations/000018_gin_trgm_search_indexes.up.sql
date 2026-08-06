-- SPDX-FileCopyrightText: 2026 FOSSology contributors
-- SPDX-License-Identifier: GPL-2.0-only

-- pg_trgm is already enabled by an earlier migration; keep this idempotent.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GET /licenses?search=... fuzzy-matches rf_spdx_id, rf_fullname, rf_shortname
-- and rf_text with ILIKE. GIN trigram indexes let the planner use (bitmap)
-- index scans for those ILIKE predicates instead of a sequential scan across
-- all rows.
--
-- The rf_text column previously only had a GiST trigram index (from
-- 000010_pg_trgm_and_index), which also supports ILIKE and the pg_trgm `%`
-- similarity operator used by getSimilarLicenses. It is replaced here with a
-- GIN index for faster lookups and consistency with the other search-field
-- indexes; GIN trades slower writes for faster reads, which suits this
-- read-heavy, low-write reference table.
DROP INDEX IF EXISTS gist_rf_text_idx;

CREATE INDEX IF NOT EXISTS gin_rf_spdx_id_idx
ON license_dbs USING gin (rf_spdx_id gin_trgm_ops);

CREATE INDEX IF NOT EXISTS gin_rf_fullname_idx
ON license_dbs USING gin (rf_fullname gin_trgm_ops);

CREATE INDEX IF NOT EXISTS gin_rf_shortname_idx
ON license_dbs USING gin (rf_shortname gin_trgm_ops);

CREATE INDEX IF NOT EXISTS gin_rf_text_idx
ON license_dbs USING gin (rf_text gin_trgm_ops);
