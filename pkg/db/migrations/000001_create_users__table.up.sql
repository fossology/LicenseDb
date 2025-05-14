-- create_users_table.sql

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    user_name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_level TEXT NOT NULL,
    user_password TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT uni_users_user_name UNIQUE (user_name),
    CONSTRAINT uni_users_user_email UNIQUE (user_email)
);

-- Foreign keys that reference `users` (optional to include here if other tables will use this later)
-- These should be part of the referencing table definitions:
-- For example:
-- CREATE TABLE audits (
--   ...
--   user_id BIGINT,
--   CONSTRAINT fk_audits_user FOREIGN KEY (user_id) REFERENCES users(id)
-- );
