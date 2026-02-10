#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2025 Dearsh Oberoi <dearsh.oberoi@siemens.com>
# SPDX-License-Identifier: GPL-2.0-only

set -euo pipefail

# --- CONFIG ---
DB_NAME="licensedb"
DB_USER="fossy"
DB_PASS="fossy"
DB_PORT=5432
DB_HOST="localhost"

ADMIN_USER="fossy_super_admin"
ADMIN_PASS="fossy_super_admin"
ADMIN_DISPLAY="fossy_super_admin"
ADMIN_EMAIL="fossy_super_admin@example.org"

# --- CONFIG FILES ---
if [ ! -f external_ref_fields.yaml ]; then
  echo "Creating external_ref_fields.yaml..."
  cp external_ref_fields.example.yaml external_ref_fields.yaml
fi

echo "Generating Go structs..."
go generate ./...

if [ ! -f .env ]; then
  echo "Creating .env file..."
  cp configs/.env.dev.example .env
fi

# --- BUILD PROJECT ---
echo "Building project..."
go build ./cmd/laas

# --- DATABASE SETUP ---
echo "Setting up PostgreSQL database..."
sudo -u postgres psql <<EOF
DO \$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}') THEN
      CREATE DATABASE ${DB_NAME};
   END IF;
END
\$\$;

DO \$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
      CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';
   END IF;
END
\$\$;

GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
ALTER DATABASE ${DB_NAME} OWNER TO ${DB_USER};
EOF

echo "✅ Database setup done!"

# --- RUN MIGRATIONS ---
echo "Running migrations..."
migrate -path pkg/db/migrations -database "postgres://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=disable" up

echo "✅ Migrations ran successfully!"

# --- Creating a super admin ---
echo "Seeding a super admin user in the database..."

psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<EOF
DO \$\$
BEGIN
   IF NOT EXISTS (
      SELECT 1 FROM users WHERE user_level = 'SUPER_ADMIN'
   ) THEN
      INSERT INTO users (user_name, user_password, user_level, display_name, user_email)
      VALUES ('${ADMIN_USER}', '${ADMIN_PASS}', 'SUPER_ADMIN', '${ADMIN_DISPLAY}', '${ADMIN_EMAIL}');
   END IF;
END
\$\$;
EOF

echo "✅ SUPER_ADMIN user ensured in database!"

# --- INFO ---
echo
echo "✅ Setup complete!"
echo "You can now run the project with:"
echo "  ./laas"
