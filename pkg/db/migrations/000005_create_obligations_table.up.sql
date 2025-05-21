CREATE TABLE IF NOT EXISTS obligations (
    id BIGSERIAL PRIMARY KEY,
    topic TEXT NOT NULL UNIQUE,
    text TEXT NOT NULL,
    modifications BOOLEAN NOT NULL DEFAULT FALSE,
    comment TEXT NOT NULL DEFAULT '',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    text_updatable BOOLEAN NOT NULL DEFAULT FALSE,
    md5 TEXT NOT NULL UNIQUE,
    obligation_classification_id BIGINT NOT NULL,
    obligation_type_id BIGINT NOT NULL,
    category TEXT DEFAULT 'GENERAL',

    CONSTRAINT fk_obligations_classification FOREIGN KEY (obligation_classification_id)
        REFERENCES obligation_classifications(id),

    CONSTRAINT fk_obligations_type FOREIGN KEY (obligation_type_id)
        REFERENCES obligation_types(id)
);
