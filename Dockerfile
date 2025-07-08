# Use official Node.js 24 image
FROM node:24-slim

# Install tini for proper signal handling and pnpm
RUN apt-get update && apt-get install -y --no-install-recommends tini && npm install -g pnpm && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod && pnpm add tsx dotenv node-cron pino pino-pretty

# Copy source code
COPY . .

# Use tini as the init system
ENTRYPOINT ["/usr/bin/tini", "--"]

# Default command: run the scheduler script with tsx
CMD ["npx", "tsx", "-r", "dotenv/config", "scheduler.ts"] 