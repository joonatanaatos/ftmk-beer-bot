FROM oven/bun:1-debian

RUN apt-get update && apt-get install -y --no-install-recommends \
      libcairo2 libpango-1.0-0 libjpeg62-turbo libgif7 librsvg2-2 \
      libpixman-1-0 \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY prisma ./prisma
COPY prisma.config.ts tsconfig.json ./
COPY src ./src
COPY index.ts ./
RUN bunx prisma generate

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["bun", "src/index.ts"]
