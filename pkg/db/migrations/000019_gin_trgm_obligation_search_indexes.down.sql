-- SPDX-FileCopyrightText: 2026 FOSSology contributors
-- SPDX-License-Identifier: GPL-2.0-only

DROP INDEX IF EXISTS gin_topic_idx;
DROP INDEX IF EXISTS gin_text_idx;

-- Restore the original GiST trigram index on text from 000010_pg_trgm_and_index.
CREATE INDEX IF NOT EXISTS gist_text_idx
ON obligations USING gist (text gist_trgm_ops);
