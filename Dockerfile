# Multi-stage build for Node.js application
FROM node:18-alpine AS dependencies

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Production stage
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodeuser:nodejs . .

# Create uploads directory with proper permissions
RUN mkdir -p /app/Uploads/voice_complaints /app/Uploads/profile_pictures && \
    chown -R nodeuser:nodejs /app/Uploads

# Switch to non-root user
USER nodeuser

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:4000/api/employees || exit 1

# Start the refactored application
CMD ["node", "index.js"] 