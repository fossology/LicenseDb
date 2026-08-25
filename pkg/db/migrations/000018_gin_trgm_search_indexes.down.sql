-- SPDX-FileCopyrightText: 2026 FOSSology contributors
-- SPDX-License-Identifier: GPL-2.0-only

DROP INDEX IF EXISTS gin_rf_spdx_id_idx;
DROP INDEX IF EXISTS gin_rf_fullname_idx;
DROP INDEX IF EXISTS gin_rf_shortname_idx;
DROP INDEX IF EXISTS gin_rf_text_idx;

-- Restore the original GiST trigram index on rf_text from 000010_pg_trgm_and_index.
CREATE INDEX IF NOT EXISTS gist_rf_text_idx
ON license_dbs USING gist (rf_text gist_trgm_ops);
