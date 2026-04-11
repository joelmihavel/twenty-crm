FROM oven/bun:1.3 AS builder
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .
ENV NEXT_PUBLIC_TWENTY_API_KEY=""
ENV NEXT_PUBLIC_TWENTY_METADATA_URL="https://hawkeye.flent.in/metadata"
ENV NEXT_PUBLIC_TWENTY_GRAPHQL_URL="https://hawkeye.flent.in/graphql"
RUN bun run build

FROM oven/bun:1.3-slim
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
ENV PORT=3001
EXPOSE 3001
CMD ["bun", "server.js"]
