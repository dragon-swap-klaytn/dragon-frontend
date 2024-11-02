# syntax=docker/dockerfile:1
FROM node:18.16.0-alpine

WORKDIR /workspace

# install git, ssh, pnpm, turbo
RUN apk add --no-cache git bash openssh python3 build-base libc6-compat && \
    npm install -g pnpm turbo tsup typescript

# set pnpm env
ENV PNPM_HOME=/app/.pnpm
ENV PATH=$PNPM_HOME:$PATH

# copy lock file, default config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .eslintrc .prettierrc .stylelintrc.js turbo.json ./

# copy other mono repo, patched packages
COPY ./packages ./packages
COPY ./apps ./apps
COPY ./apis ./apis
COPY ./scripts ./scripts
COPY ./patches ./patches

# install dependencies
RUN pnpm install

ARG NODE_ENV=production
ARG NEXT_DGSWAP_GATEWAY=https://gateway.graph.dgswap.io

ENV NODE_ENV=${NODE_ENV}
ENV NEXT_DGSWAP_GATEWAY=${NEXT_DGSWAP_GATEWAY}

# build and start
RUN pnpm build

EXPOSE 3000

ENTRYPOINT [ "pnpm", "start" ]
