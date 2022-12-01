# Datenort

<h3 align="center">a file management api</h3>

## Features
- file upload
- extraction of meta data
- image processing (blurhash and image colors)
- works with any filetype
- storage implementation with AWS S3


## Quickstart

```batch
# install dependencies
$ npm run install

# serve
$ npm run start

# build for production
$  npm run build
$  npm run start:prod
```

## Running as a Docker

```
# build docker image
docker compose build

# start docker image
docker compose up
```

## Configuring the Server



| Variable                       |                                                  Description                                                  | Necessary? |
|:-------------------------------|:-------------------------------------------------------------------------------------------------------------:|:----------:|
| DATABASE_URL                   | Used for the PostgresDB Connection.<br>Syntax: postgres://{user}:{password}@{hostname}:{port}/{database-name} |    Yes     |
| TOKEN_AUTHORIZATION_URL        |                  It's used for the JWT authorization to protect the endpoints (recommended)                   |  Depends   |
| AWS_ACCESS_KEY_ID              |                                          AWS S3 Bucket authorization                                          |    Yes     |
| AWS_SECRET_ACCESS_KEY          |                                          AWS S3 Bucket authorization                                          |    Yes     |
| NB_INSTANCES                   |                  Determines the number of instances run in the cluster<br/><b>Default</b>: 2                  |     No     |
| NODE_ENV                       |        Also determines the instances in the cluster. When it's set to "test", 1 instance will be run.         |     No     |
