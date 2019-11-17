FROM node:12 AS builder

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

## Install dependencies
COPY ["./package.json", "./package-lock.json", "/usr/src/app/"]

RUN npm install

## Add source code
COPY ["./tsconfig.json", "/usr/src/app/"]
COPY "./src" "/usr/src/app/src/"

## Build
RUN npm run build

# PRODUCTION IMAGE

FROM node:12-alpine

RUN mkdir -p /usr/app
WORKDIR /usr/app

COPY --from=builder [\
  "/usr/src/app/package.json", \
  "/usr/src/app/package-lock.json", \
  "/usr/app/" \
  ]

COPY --from=builder "/usr/src/app/dist" "/usr/app/dist"

RUN npm install --only=prod

EXPOSE 3000

ENTRYPOINT [ "npm", "start" ]
