# Use official Node.js 24 image
FROM node:24-slim

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod

# Copy source code
COPY . .

# Use the default tini entrypoint from node:slim
CMD ["npx", "tsx", "-r", "dotenv/config", "scheduler.ts"] 