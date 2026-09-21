FROM oven/bun:1.2

WORKDIR /app

ENV NODE_ENV=production

COPY package.json bun.lock bunfig.toml ./
COPY src ./src
COPY styles ./styles

RUN bun install --frozen-lockfile

EXPOSE 3000

CMD ["bun", "src/index.ts"]