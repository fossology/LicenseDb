-- SPDX-FileCopyrightText: 2025 Chayan Das <01chayandas@gmail.com>
-- SPDX-License-Identifier: GPL-2.0-only

-- Drop the GIN index
DROP INDEX IF EXISTS trgm_rf_text_idx;

-- Drop pg_trgm extension
DROP EXTENSION IF EXISTS pg_trgm;
