# --- Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install all dependencies (development + production)
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build the client SPA and compile server.ts to dist/server.cjs
RUN npm run build

# --- Production Stage ---
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
# Default port for production container
ENV PORT=5000

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Expose production port
EXPOSE 5000

# Run the compiled backend Express/CJS server
CMD ["npm", "run", "start"]
