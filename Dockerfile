###############################################################################
###############################################################################
##                      _______ _____ ______ _____                           ##
##                     |__   __/ ____|  ____|  __ \                          ##
##                        | | | (___ | |__  | |  | |                         ##
##                        | |  \___ \|  __| | |  | |                         ##
##                        | |  ____) | |____| |__| |                         ##
##                        |_| |_____/|______|_____/                          ##
##                                                                           ##
## description     : Dockerfile for TsED Application                         ##
## author          : TsED team                                               ##
## date            : 2022-03-05                                              ##
## version         : 2.0                                                     ##
##                                                                           ##
###############################################################################
###############################################################################
ARG NODE_VERSION=16

FROM node:16-slim as build
WORKDIR /opt

COPY package.json package-lock.json tsconfig.json tsconfig.compile.json .barrelsby.json ./

RUN npm install

COPY ./src ./src

FROM node:16-slim as runtime
ENV WORKDIR /opt
WORKDIR $WORKDIR

RUN apt-get update
RUN apt-get install -y git curl build-essential openssl

RUN npm install -g pm2

COPY --from=build /opt .

RUN npm install
COPY ./prisma ./prisma
RUN npm run prisma:generate
RUN npm run build
COPY processes.config.js .

EXPOSE 8081
ENV PORT 8081
ENV NODE_ENV production

CMD ["pm2-runtime", "start", "processes.config.js", "--env", "production"]
