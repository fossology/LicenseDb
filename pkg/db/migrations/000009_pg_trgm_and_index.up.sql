-- SPDX-FileCopyrightText: 2025 Chayan Das <01chayandas@gmail.com>
-- SPDX-License-Identifier: GPL-2.0-only

-- Enable pg_trgm extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN index for fuzzy search on rf_text(license)
CREATE INDEX IF NOT EXISTS trgm_rf_text_idx
ON license_dbs USING gin (rf_text gin_trgm_ops);

-- Create GIN index for fuzzy search on text(obligation)
CREATE INDEX IF NOT EXISTS trgm_text_idx
ON obligations USING gin (text gin_trgm_ops);
