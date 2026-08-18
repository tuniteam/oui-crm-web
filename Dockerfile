# =============================================================================
# Multi-stage Dockerfile for React/Vite application
# Supports: dev, uat, prod environments
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Base image with dependencies
# -----------------------------------------------------------------------------
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package.json package-lock.json* ./

# -----------------------------------------------------------------------------
# Stage 2: Development
# -----------------------------------------------------------------------------
FROM base AS dev

# Install all dependencies (including devDependencies)
RUN npm install

# Copy source code (will be overridden by volume mount in dev)
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start development server with host binding for Docker
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# -----------------------------------------------------------------------------
# Stage 3: Builder (for UAT and Prod)
# -----------------------------------------------------------------------------
FROM base AS builder

# Accept build arguments for environment variables
ARG VITE_API_BASE_URL
ARG VITE_BASE_URL

# Set environment variables for build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_BASE_URL=$VITE_BASE_URL

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .



# Build the application
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 4: UAT (User Acceptance Testing)
# -----------------------------------------------------------------------------
FROM nginx:alpine AS uat

# Copy nginx configuration
COPY nginx-uat.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add UAT-specific headers
RUN sed -i 's|add_header X-Frame-Options "SAMEORIGIN" always;|add_header X-Frame-Options "SAMEORIGIN" always;\n    add_header X-Environment "UAT" always;|g' /etc/nginx/conf.d/default.conf


EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# -----------------------------------------------------------------------------
# Stage 5: Production
# -----------------------------------------------------------------------------
FROM nginx:alpine AS prod

# Copy nginx configuration
COPY nginx-prod.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add production-specific security headers
RUN sed -i 's|add_header X-XSS-Protection "1; mode=block" always;|add_header X-XSS-Protection "1; mode=block" always;\n    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;|g' /etc/nginx/conf.d/default.conf


EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]