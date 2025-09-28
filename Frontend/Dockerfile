
# SPDX-License-Identifier: GPL-2.0-only
#  SPDX-FileCopyrightText: © 2025 Siemens AG
#  SPDX-FileContributor: 2025 Chayan Das <01chayandas@gmail.com>

# Use Node.js image
FROM node:20-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN apk add --no-cache curl bash

EXPOSE 3000

CMD ["npm", "start"]
