# Use Node.js 18 LTS as base image
FROM node:18-alpine AS base

# Install dumb-init for proper signal handling and curl for health checks
RUN apk add --no-cache dumb-init curl

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S voice-cloner -u 1001

# Development stage
FROM base AS development
ENV NODE_ENV=development
RUN npm ci
COPY . .
RUN npx prisma generate
USER voice-cloner
EXPOSE 5000
CMD ["dumb-init", "npm", "run", "dev"]

# Build stage
FROM base AS build
ENV NODE_ENV=production
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init and curl
RUN apk add --no-cache dumb-init curl

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S voice-cloner -u 1001

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy built application from build stage
COPY --from=build --chown=voice-cloner:nodejs /app/dist ./dist

# Create necessary directories
RUN mkdir -p uploads/voice-samples logs && chown -R voice-cloner:nodejs uploads logs

# Switch to non-root user
USER voice-cloner

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start application
CMD ["dumb-init", "node", "dist/index.js"]