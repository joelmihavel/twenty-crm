FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV NEXT_PUBLIC_TWENTY_API_KEY=""
ENV NEXT_PUBLIC_TWENTY_METADATA_URL="https://hawkeye.flent.in/metadata"
ENV NEXT_PUBLIC_TWENTY_GRAPHQL_URL="https://hawkeye.flent.in/graphql"
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
ENV PORT=3001
EXPOSE 3001
CMD ["node", "server.js"]
