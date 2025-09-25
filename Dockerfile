# Use Node.js 18 Alpine image
FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache \
    nftables \
    sudo \
    bash

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Give nextjs user sudo privileges for NFTables
RUN echo "nextjs ALL=(ALL) NOPASSWD: /sbin/nft" >> /etc/sudoers

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/status || exit 1

# Start the application
CMD ["npm", "start"]
