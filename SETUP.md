<!-- SPDX-FileCopyrightText: 2025 Dearsh Oberoi <dearsh.oberoi@siemens.com>

     SPDX-License-Identifier: GPL-2.0-only
-->

## Prerequisites

Before setting up the project, ensure the following tools are installed on your system:

### 1. Golang (Go)

You’ll need Go installed to build and run the project.  
👉 [Official installation guide](https://go.dev/doc/install)

### 2. PostgreSQL (v14 or later)

The project uses PostgreSQL as its database. You can install it via:

### Option A: Package Manager (Linux example)

```bash
sudo apt update
sudo apt install postgresql
```

### Option B: Official Installer

Download and run the official installer for your operating system from the PostgreSQL website.
👉 [https://www.postgresql.org/download/](https://www.postgresql.org/download/)

### 3. Install golang-migrate CLI

### For Linux & macOS

```bash
curl -L https://github.com/golang-migrate/migrate/releases/latest/download/migrate.linux-amd64.tar.gz | tar xvz
sudo mv migrate /usr/local/bin/
```

For other platforms and installation methods, check the official docs:
👉 [https://github.com/golang-migrate/migrate](https://github.com/golang-migrate/migrate)

### 4. Install swagger document generator

You'll need ```swag``` installed to build swagger docs.

```bash
go install github.com/swaggo/swag/cmd/swag@latest
```

## Environment variables

LicenseDb reads configuration from a `.env` file in the project root. Start
with [`configs/.env.dev.example`](configs/.env.dev.example) for a development
installation or [`configs/.env.test.example`](configs/.env.test.example) for
testing. Replace placeholder secrets and provider-specific values before
starting the application. For docker installation, you can customize LicenseDB
behavior via environment variables in the `docker-compose.yml`.

| Variable | Required | Description |
| --- | --- | --- |
| `TOKEN_HOUR_LIFESPAN` | Yes | Lifetime of an access token in hours. |
| `API_SECRET` | Yes | Secret used to sign access tokens. |
| `DEFAULT_ISSUER` | Yes | Issuer URL used for tokens issued by LicenseDb, for example `http://localhost:8080`. |
| `REFRESH_TOKEN_HOUR_LIFESPAN` | Yes | Lifetime of a refresh token in hours. |
| `REFRESH_TOKEN_SECRET` | Yes | Secret used to sign refresh tokens. |
| `PORT` | No | Port on which the API listens. |
| `READ_API_AUTHENTICATION_ENABLED` | No | Enables authentication for read APIs when set to `true`. Defaults to `false`. |
| `DB_HOST` | Yes | PostgreSQL server hostname. |
| `DB_PORT` | Yes | PostgreSQL server port. |
| `DB_USER` | Yes | PostgreSQL username. |
| `DB_PASSWORD` | Yes | PostgreSQL password. |
| `DB_NAME` | Yes | PostgreSQL database name. |
| `JWKS_URI` | Required when `OIDC_ISSUER` is set | OIDC provider URL used to retrieve signing keys. |
| `OIDC_ISSUER` | No | Expected issuer value for OIDC tokens. Set this to enable OIDC authentication. |
| `OIDC_USERNAME_KEY` | Required when `OIDC_ISSUER` is set | OIDC token claim containing the username. |
| `OIDC_EMAIL_KEY` | Required when `OIDC_ISSUER` is set | OIDC token claim containing the email address. |
| `OIDC_DISPLAYNAME_KEY` | Required when `OIDC_ISSUER` is set | OIDC token claim containing the display name. |
| `OIDC_SIGNING_ALG` | No | Signing algorithm to use when the OIDC provider does not include an `alg` header. |
| `OIDC_CLIENT_TO_USER_MAPPER_CLAIM` | No | OIDC token claim used to map machine-to-machine clients to users. |
| `SIMILARITY_THRESHOLD` | No | Similarity threshold for license matching. Higher values make matching stricter. |
| `ENABLE_SMTP` | No | Enables email services when set to `true`. |
| `SMTP_HOST` | Required when SMTP is enabled | SMTP server hostname. |
| `SMTP_PORT` | Required when SMTP is enabled | SMTP server port. |
| `SMTP_USER` | Required when SMTP is enabled | SMTP username. |
| `SMTP_PASSWORD` | Required when SMTP is enabled | SMTP password. |
| `SMTP_FROM` | Required when SMTP is enabled | Email address used as the sender. |

## Project Setup

There are 3 ways to run LicenseDb.

## 1. Docker Image

This option runs LicenseDb using the published container image from GitHub
Container Registry.

```bash
# Pull the latest stable release
docker pull ghcr.io/fossology/licensedb:latest

# Run LicenseDB (requires a PostgreSQL instance)
docker run \
  --name licensedb \
  -p 8080:8080 \
  -e DB_HOST=<your-postgres-host> \
  -e DB_PORT=5432 \
  -e DB_USER=fossy \
  -e DB_PASSWORD=fossy \
  -e DB_NAME=licensedb \
  ghcr.io/fossology/licensedb:latest
```

> ⚠️ This method requires you to have PostgreSQL running separately.  
> If you’d like an **all-in-one setup** with PostgreSQL included, use the Docker Compose option below.

## 2. Docker Compose (recommended)

- Build the app image
  
```bash
docker build -t licensedb/latest .
```

- Run the container
  
```bash
docker compose up
```

### 🔍 Verify the Setup

Once containers are running, you can check:

```bash
# List running containers
docker ps

# View logs for LicenseDB
docker logs -f licensedb
```

## 3. Bare metal Installation

### 1. Setting up the project

- Create the `external_ref_fields.yaml` file in the root directory of the project to extend the schema of licenses and obligations with custom fields.

```bash
cp external_ref_fields.example.yaml external_ref_fields.yaml
vim external_ref_fields.yaml
```

- Generate Go struct for the extra fields listed in the external_ref_fields.yaml.

```bash
go generate ./...
```

- Create the `.env` file in the root directory of the project and change the
  values of the environment variables as per your requirement.

```bash
cp configs/.env.dev.example .env
vim .env
```

- Build the project using following command.

```bash
go build ./cmd/laas
```

### 2. Setting up the database

- Create database licensedb and provide user fossy all privileges to it.
  
```sql
CREATE DATABASE licensedb;

CREATE USER fossy WITH PASSWORD 'fossy';

GRANT ALL PRIVILEGES ON DATABASE licensedb TO fossy;
```

- Run the migration files.

```bash
migrate -path pkg/db/migrations -database "postgres://fossy:fossy@localhost:5432/licensedb?sslmode=disable" up
```

- Create first user

Connect to the database using `psql` with the following command.

```bash
psql -h localhost -p 5432 -U fossy -d licensedb
```

Run the following query to create the first user.

```sql
INSERT INTO users (user_name, user_password, user_level, display_name, user_email) VALUES ('<username>', '<password>', 'SUPER_ADMIN', '<display_name>', '<user_email>');
```

### 3. Run the executable

```bash
./laas
```

Use the command below for more startup options.

```bash
./laas --help
```

- You can directly run it by the following command.

```bash
go run ./cmd/laas
```

## Post Install

- ### Generating Swagger Documentation

  - This step can be skipped if installation is done via the ```easy_install``` script.
  - Install [swag](https://github.com/swaggo/swag) using the following command.

      ```bash
      go install github.com/swaggo/swag/cmd/swag@latest
      ```

  - Run the following command to generate swagger documentation.
      <!-- https://github.com/swaggo/swag/issues/817#issuecomment-730895033 -->
      ```bash
      swag init --parseDependency --generalInfo api.go --dir ./pkg/api,./pkg/auth,./pkg/db,./pkg/models,./pkg/utils --output ./cmd/laas/docs
      ```

  - Swagger documentation will be generated in `./cmd/laas/docs` folder.
  - Run the project and navigate to `http://localhost:8080/swagger/index.html` to view the documentation.
  - After changing any documentation comments, format them with following command.

      ```bash
      swag fmt --generalInfo ./pkg/api/api.go --dir ./pkg/api,./pkg/auth,./pkg/db,./pkg/models,./pkg/utils
      ```

- Only the super admin user can create new app users, import licenses and obligations.

  To gain further capabilities, create a new admin user via the swagger docs or via the [LicenseDb UI](https://github.com/fossology/LicenseDb-UI).

- ### Frontend Installatiion
    - If you are also installing the frontend, use the same external fields file ```external_ref_fields.yaml``` there.

## Testing (local)

The PostgreSQL user `fossy` must have the `CREATEDB` privilege in order to:

- Programmatically create and drop a test database.
- Apply migrations on the test DB before running tests.

```bash
sudo -u postgres psql; // log into psql with postgres super user 
ALTER USER fossy CREATEDB; // alter the role for fossy
\du ;                     // verify role 
```

Create the `.env.test` file file in the `configs` directory of the project.

```bash
cp configs/.env.test.example .env.test
```

Run the following command from the root of the project.

```bash
go test ./...
```