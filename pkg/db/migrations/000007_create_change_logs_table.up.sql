CREATE TABLE IF NOT EXISTS change_logs (
    id BIGSERIAL PRIMARY KEY,
    field TEXT,
    updated_value TEXT,
    old_value TEXT,
    audit_id BIGINT,

    CONSTRAINT fk_audits_change_logs FOREIGN KEY (audit_id) REFERENCES audits(id)
);
