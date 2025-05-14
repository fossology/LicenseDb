CREATE TABLE IF NOT EXISTS obligation_classifications (
    id BIGSERIAL PRIMARY KEY,
    classification TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT TRUE
);
