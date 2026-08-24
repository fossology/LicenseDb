-- SPDX-FileCopyrightText: 2026 Siemens AG
-- SPDX-FileContributor: Dearsh Oberoi <dearsh.oberoi@siemens.com>
--
-- SPDX-License-Identifier: GPL-2.0-only

BEGIN;
ALTER TABLE obligations ADD COLUMN category TEXT DEFAULT 'GENERAL'::text;
UPDATE obligations
    SET category = (
        SELECT category FROM obligation_categories
        WHERE obligation_categories.id = obligations.obligation_category_id
    );
ALTER TABLE obligations DROP CONSTRAINT fk_obligation_category;
ALTER TABLE obligations DROP COLUMN obligation_category_id;

DELETE FROM change_logs WHERE audit_id IN (SELECT id FROM audits WHERE type = 'CATEGORY');
DELETE FROM audits WHERE type = 'CATEGORY';

DROP TABLE IF EXISTS obligation_categories;
COMMIT;