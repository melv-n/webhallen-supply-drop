# Use official Node.js 20 image
FROM node:24-slim

# Install tini for proper signal handling
RUN apt-get update && apt-get install -y --no-install-recommends tini && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json yarn.lock* package-lock.json* ./
RUN npm install --production && npm install --no-save tsx dotenv node-cron

# Copy source code
COPY . .

# Use tini as the init system
ENTRYPOINT ["/usr/bin/tini", "--"]

# Default command: run the scheduler script with tsx
CMD ["npx", "tsx", "-r", "dotenv/config", "scheduler.ts"] 