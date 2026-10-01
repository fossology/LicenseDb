<!-- SPDX-FileCopyrightText: 2023 Kavya Shukla <kavyuushukla@gmail.com>
     SPDX-FileCopyrightText: 2025 Kaushlendra Pratap <kaushlendra-pratap.singh@siemens.com>
     SPDX-FileCopyrightText: 2025 Dearsh Oberoi <dearsh.oberoi@siemens.com>
     SPDX-License-Identifier: GPL-2.0-only
-->
# LicenseDb

License as a service provides a convenient and effective way for organizations to
manage their use of open-source licenses and obligations. With the growing popularity
of open-source software, organizations are finding it more difficult to keep track of
the various licenses, obligations, and terms under which they are permitted to use and
distribute open-source components. Open-source licenses and their obligations can be
complicated, making it difficult to understand how they apply to a specific piece of
software or interact with other licenses. LicenseDb helps organizations and tools like
[FOSSology](https://fossology.org) and [SW360](https://eclipse.org/sw360) identify,
filter, manage, and associate licenses with their obligations. There are benefits of
this service such as increasing flexibility, a faster time-to-access, and managing the
database.

## Database

Licensedb database has licenses, obligations, obligation map, users, their audits
and changes.

- **license_dbs** table has list of licenses and all the data related to the licenses.
- **obligations** table has the list of obligations that are related to the licenses.
- **obligation_classifications** table has the list of classifications that are related to the obligations.
- **obligation_types** table has the list of types that are related to the obligations.
- **obligation_maps** table that maps obligations to their respective licenses.
- **users** table has the user that are associated with the licenses.
- **audits** table has the data of audits that are done in obligations or licenses.
- **change_logs** table has all the change history of a particular audit.
- **oidc_clients** table has all the oidc clients used for communication with fossology.

The database schema can be extended with custom fields for licenses and
obligations through the `external_ref_fields.yaml` configuration file. Copy
`external_ref_fields.example.yaml` to `external_ref_fields.yaml`, define the
additional fields, and run `go generate ./...` to generate the corresponding
Go structures.

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

## How to run this project?

👉 Please follow the [Setup Guide](./SETUP.md) for step-by-step instructions on how to run the project.
