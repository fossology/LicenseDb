<!-- SPDX-FileCopyrightText: 2023 Kavya Shukla <kavyuushukla@gmail.com>

     SPDX-License-Identifier: GPL-2.0-only
-->
# LicenseDb

License as a service provides a convenient and effective way for organizations to
manage their use of open-source licenses. With the growing popularity of open-source
software, organizations are finding it more difficult to keep track of the various
licenses and terms under which they are permitted to use open-source components.
Open-source licenses can be complicated, making it difficult to understand how they
apply to a specific piece of software or interact with other licenses. It can be
used for various purposes by organizations and tools like [FOSSology](https://fossology.org)
and [SW360](https://eclipse.org/sw360) like license identification, filtering, and
managing licenses. There are benefits of this service such as increasing flexibility,
a faster time-to-access, and managing the database.

## Database

Licensedb database has licenses, obligations, obligation map, users, their audits
and changes.

- **license_dbs** table has list of licenses and all the data related to the licenses.
- **obligations** table has the list of obligations that are related to the licenses.
- **obligation_maps** table that maps obligations to their respective licenses.
- **users** table has the user that are associated with the licenses.
- **audits** table has the data of audits that are done in obligations or licenses
- **change_logs** table has all the change history of a particular audit.

![ER Diagram](./docs/assets/licensedb_erd.png)

## APIs

There are multiple API endpoints for licenses, obligations, user and audit
endpoints.

### API endpoints

Check the OpenAPI documentation for the API endpoints at
[cmd/laas/docs/swagger.yaml](https://github.com/fossology/LicenseDb/blob/main/cmd/laas/docs/swagger.yaml).

The same can be viewed by Swagger UI plugin after installing and running the
tool at [http://localhost:8080/swagger/index.html](http://localhost:8080/swagger/index.html).

### Authentication

To get the access token, send a POST request to `/api/v1/login` with the
username and password.

```bash
curl -X POST "http://localhost:8080/api/v1/login" \
-H "accept: application/json" -H "Content-Type: application/json" \
-d "{ \"username\": \"<username>\", \"password\": \"<password>\"}"
```

As the response of the request, a JWT will be returned. Use this JWT with the
`Authorization` header (as `-H "Authorization: <JWT>"`) to access endpoints
requiring authentication.

## Prerequisites

Before setting up the project, ensure the following tools are installed on your system:

### 1. Golang (Go)

You’ll need Go installed to build and run the project.  
👉 [Official installation guide](https://go.dev/doc/install)

### 2. PostgreSQL (v14 or later)

The project uses PostgreSQL as its database. You can install it via:

#### Option A: Package Manager (Linux example)

```bash
sudo apt update
sudo apt install postgresql
```

#### Option B: Official Installer

Download and run the official installer for your operating system from the PostgreSQL website.
👉 [https://www.postgresql.org/download/](https://www.postgresql.org/download/)

### 3. Install golang-migrate CLI

#### For Linux & macOS

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

## How to run this project?

👉 Please follow the [Setup Guide](./SETUP.md) for step-by-step instructions on how to run the project.

### Testing (local)

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
