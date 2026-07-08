-- SPDX-FileCopyrightText: 2026 Siemens AG
-- SPDX-FileContributor: Dearsh Oberoi <dearsh.oberoi@siemens.com>

-- SPDX-License-Identifier: GPL-2.0-only


ALTER TABLE oidc_clients DROP COLUMN IF EXISTS description;
ALTER TABLE oidc_clients DROP COLUMN IF EXISTS name;
