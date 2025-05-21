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

