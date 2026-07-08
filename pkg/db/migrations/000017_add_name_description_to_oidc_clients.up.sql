-- SPDX-FileCopyrightText: 2026 Siemens AG
-- SPDX-FileContributor: Dearsh Oberoi <dearsh.oberoi@siemens.com>

-- SPDX-License-Identifier: GPL-2.0-only

ALTER TABLE oidc_clients ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE oidc_clients ADD COLUMN IF NOT EXISTS description TEXT;

UPDATE oidc_clients
SET name = client_id
WHERE name IS NULL OR btrim(name) = '';

UPDATE oidc_clients
SET description = 'OIDC client for ' || client_id
WHERE description IS NULL OR btrim(description) = '';

ALTER TABLE oidc_clients ALTER COLUMN name SET NOT NULL;
ALTER TABLE oidc_clients ALTER COLUMN description SET NOT NULL;

ALTER TABLE oidc_clients ALTER COLUMN name SET DEFAULT '';
ALTER TABLE oidc_clients ALTER COLUMN description SET DEFAULT '';
