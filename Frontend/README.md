<!-- 
    SPDX-FileCopyrightText: © Fossology contributors
    SPDX-License-Identifier: GPL-2.0-only
-->

# LicenseDB-UI

![LicenseDB-UI](src/assets/images/logo.png)

License as a service provides a convenient and effective way for organizations to manage their open-source licenses and more. With the ever growing list of Open-Source licenses, organizations find it difficult to keep track of obligations of a license, restrictions, and other related information. When you have multiple software working on the domain, keeping them consistent is even more difficult. LicenseDb tries to provide that central store to keep all your Licenses in a neat tool, linked with their respective obligations. LicenseDb, with help of ExternalRef, allows you to keep your custom information about the license tied to it. Designed to be used for various purposes by organizations and tools like FOSSology and SW360 for fast and simple information management and retrieval.

The frontend for [LicenseDB](https://github.com/fossology/LicenseDb).

## API Documentation

- Check the OpenAPI documentation for the API endpoints at
[cmd/laas/docs/swagger.yaml](https://github.com/fossology/LicenseDb/blob/main/cmd/laas/docs/swagger.yaml).

- The same can be viewed by Swagger UI plugin after installing and running the
LicenseDB backend at [http://localhost:8080/swagger/index.html](http://localhost:8080/swagger/index.html).

## Prerequisites

- ```NodeJS``` LTS version
- ```npm```
- Using a Node version manager like [```nvm```](https://github.com/nvm-sh/nvm) is strongly recommended for installing ```NodeJS``` and ```npm```.

## Set Up

- Set the following environment variables:
    - ```REACT_APP_DOMAIN_SUBDIRECTORY```: The basename of the app for situations where you can't deploy to the root of the domain, but a sub directory.
    - ```PUBLIC_URL```: The URL at which the application is hosted, along with the subdirectory.
    - ```REACT_APP_BASE_URL```: The URL at which backend of the application is hosted.
    - ```REACT_APP_PROVIDER```: ```oidc``` or ```password```. Used to configure login mechanism of the application as OIDC or username-password.  
    - ```REACT_APP_CLIENT_ID```: The client id of the app instance registered with the OIDC tenant.
    - ```REACT_APP_AUTH_URL```: The authorization url of the app instance registered with the OIDC tenant.
    - ```REACT_APP_TOKEN_URL```: The token url of the app instance registered with the OIDC tenant.
    - ```REACT_APP_REDIRECT_URL```=```http://localhost:3000/redirect```

    See .env.example for more details.
- Install dependencies
   ``` bash 
   npm install
   ```
- Run application
  ```bash
  npm start
  ```
- If everything went well, the localhost port 3000 will be opened in your host and you will be able to access the application.
