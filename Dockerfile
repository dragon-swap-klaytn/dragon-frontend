# syntax=docker/dockerfile:1
FROM node:18.16.0-alpine

WORKDIR /workspace

# install git, ssh
RUN apk add --no-cache git bash openssh

# install pnpm, turbo
RUN npm install -g pnpm turbo tsup typescript
RUN apk add --no-cache libc6-compat
RUN apk update

# set pnpm env
ENV PNPM_HOME=/app/.pnpm
ENV PATH=$PNPM_HOME:$PATH

# copy lock file, default config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .eslintrc .prettierrc .stylelintrc.js turbo.json ./

# copy other mono repo, patched packages
COPY ./packages ./packages
COPY ./apps ./apps
COPY ./apis ./apis
COPY ./examples ./examples
COPY ./scripts ./scripts
COPY ./patches ./patches

# install dependencies
RUN pnpm install

ARG NODE_ENV=${NODE_ENV}

# build and start
RUN pnpm build

EXPOSE 3000

ENTRYPOINT [ "pnpm", "start" ]