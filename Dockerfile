FROM oven/bun:alpine AS deps
WORKDIR /usr/app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production

FROM oven/bun:alpine AS release
WORKDIR /usr/app

COPY --from=deps /usr/app/node_modules ./node_modules
COPY --from=deps /usr/app/bun.lock* ./

COPY src ./src
COPY package.json .

USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "start" ]