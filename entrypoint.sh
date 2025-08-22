#!/bin/bash
# SPDX-FileCopyrightText: 2024 Kaushlendra Pratap <kaushlendra-pratap.singh@siemens.com>
# SPDX-License-Identifier: GPL-2.0-only

set -eo

db_host="${DB_HOST:-localhost}"
db_port="${DB_PORT:-5432}"
db_name="${DB_NAME:-licensedb}"
db_user="${DB_USER:-fossy}"
db_password="${DB_PASSWORD:-fossy}"
populate_db="${POPULATE_DB:-true}"
data_file="/app/licenseRef.json"

sed -i "s|^API_SECRET=.*|API_SECRET=$(openssl rand -hex 32)|" /app/.env

echo "Database does not exist, running migrations..."
migrate -path /app/pkg/db/migrations -database "postgres://$db_user:$db_password@$db_host:$db_port/$db_name?sslmode=disable" up

echo "Inserting initial SUPER_ADMIN user..."
PGPASSWORD=$db_password psql -h "$db_host" -U "$db_user" -p "$db_port" -d "$db_name" -c \
  "INSERT INTO users (user_name, user_password, user_level, display_name, user_email)
   SELECT 'fossy_super_admin', 'fossy_super_admin', 'SUPER_ADMIN', 'fossy_super_admin', 'fossy_super_admin@fossy.com'
   WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_level='SUPER_ADMIN');"


echo "Starting LAAS service..."
/app/laas -host=$db_host -port=$db_port -user=$db_user -dbname=$db_name \
  -password=$db_password -datafile="$data_file" -populatedb=$populate_db

