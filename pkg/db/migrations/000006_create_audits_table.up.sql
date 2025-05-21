CREATE TABLE IF NOT EXISTS audits (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    timestamp TIMESTAMPTZ,
    type TEXT,
    type_id BIGINT,

    CONSTRAINT fk_audits_user FOREIGN KEY (user_id) REFERENCES users(id)
);
