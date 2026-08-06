-- SPDX-FileCopyrightText: 2026 FOSSology contributors
-- SPDX-License-Identifier: GPL-2.0-only

-- pg_trgm is already enabled by an earlier migration; keep this idempotent.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GET /obligations?search=... fuzzy-matches topic and text with ILIKE. GIN
-- trigram indexes let the planner use (bitmap) index scans for those ILIKE
-- predicates instead of a sequential scan across all rows.
--
-- The text column previously only had a GiST trigram index (from
-- 000010_pg_trgm_and_index), which also supports ILIKE and the pg_trgm `%`
-- similarity operator used by getSimilarObligations. It is replaced here with
-- a GIN index for faster lookups and consistency with the new topic index;
-- GIN trades slower writes for faster reads, which suits this read-heavy,
-- low-write reference table.
DROP INDEX IF EXISTS gist_text_idx;

CREATE INDEX IF NOT EXISTS gin_topic_idx
ON obligations USING gin (topic gin_trgm_ops);

CREATE INDEX IF NOT EXISTS gin_text_idx
ON obligations USING gin (text gin_trgm_ops);
