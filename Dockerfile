# syntax=docker/dockerfile:1
FROM node:18.20.4-alpine

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
ARG NEXT_PUBLIC_DGSWAP_GATEWAY=https://gateway.graph.dgswap.io
ARG NEXT_PUBLIC_WALLET_CONNECT_ID=7eb02e7ebd6f7197f9e238e8a0331476
ARG USE_MONGO_CACHE=true

ENV NODE_ENV=${NODE_ENV}
ENV NEXT_PUBLIC_DGSWAP_GATEWAY=${NEXT_PUBLIC_DGSWAP_GATEWAY}
ENV NEXT_PUBLIC_WALLET_CONNECT_ID=${NEXT_PUBLIC_WALLET_CONNECT_ID}
ENV USE_MONGO_CACHE=${USE_MONGO_CACHE}

# build and start
RUN pnpm build

EXPOSE 3000

# ENTRYPOINT [ "pnpm", "start" ]
CMD ["/bin/bash", "-c", "env && exec pnpm start"]
