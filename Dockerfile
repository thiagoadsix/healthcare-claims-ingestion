# Use a lightweight Node.js image
FROM node:20-alpine AS base

WORKDIR /usr/src/app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Build TypeScript
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Prepare production image
FROM node:20-alpine AS production
ENV NODE_ENV=production
WORKDIR /usr/src/app

# Only copy necessary files
COPY --from=base /usr/src/app/package.json ./
COPY --from=base /usr/src/app/node_modules ./node_modules
COPY --from=base /usr/src/app/dist ./dist

# Expose app port
EXPOSE 3000

# Default environment (can be overridden by docker-compose or env file)
ENV PORT=3000

# Run application
CMD ["node", "dist/index.js"]
