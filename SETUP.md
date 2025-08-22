<!-- SPDX-FileCopyrightText: 2025 Dearsh Oberoi <dearsh.oberoi@siemens.com>

     SPDX-License-Identifier: GPL-2.0-only
-->

# Project Setup

There are 3 ways to run LicenseDb.

## 1. Easy Install Script

The easiest of them all is via the easy install script.

- (Optional) Edit the ```configs/.env.dev.example``` to set the environment variables. If not done, default values will be taken.
  
- (Optional) Edit the ```external_ref_fields.example.yaml``` to extend the schema of licenses and obligations with custom fields. If not done, default values will be taken.

- Run the easy install script to generate the app binary.
  
```bash
./easy_install.sh
```

- Run the executable

```bash
./laas
```

Use the command below for more startup options.

```bash
./laas --help
```

## 2. Docker Installation

- Build the app image
  
```bash
docker build -t licensedb/latest .
```

- Run the container
  
```bash
docker compose up
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
