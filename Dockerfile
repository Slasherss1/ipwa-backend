FROM node:20-alpine AS build
WORKDIR /build
ADD "package*.json" ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS server
WORKDIR /app
COPY --from=build /build/package*.json ./
COPY --from=build /build/dist/ipwa-server.js ./index.cjs
RUN --mount=type=cache,target=/root/.npm npm ci --omit dev
RUN --mount=type=cache,target=/root/.npm npm install pm2 -g
EXPOSE 8080
ENV NODE_ENV=production
CMD [ "pm2-runtime", "--json", "index.cjs" ]