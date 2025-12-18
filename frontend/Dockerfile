FROM node:20-alpine AS base

WORKDIR /app/

COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

COPY . .

FROM base AS builder
RUN npm run build

FROM caddy:latest AS production
COPY --from=builder /app/dist/ /usr/share/caddy/

EXPOSE 80 443/tcp 443/udp
