# Use a lightweight Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (optimizes cache)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Expose the port defined in your .env
EXPOSE 8000

# Start the server
CMD ["node", "server.js"]