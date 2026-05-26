FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json .sequelizerc ./
COPY src ./src
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json .sequelizerc ./
RUN npm ci
COPY --from=builder /app/dist ./dist
COPY src/config/sequelize.config.js ./src/config/
COPY src/migrations ./src/migrations
RUN mkdir -p uploads
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh
EXPOSE 3001
CMD ["sh", "docker-entrypoint.sh"]
