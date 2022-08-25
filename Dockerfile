FROM node:18-alpine

# Create app/working/bot directory
RUN mkdir -p /app
WORKDIR /app

# Install dependencies

# Production ONLY
COPY package*.json ./
RUN npm ci --omit=dev

# Development
# COPY package.json ./
# RUN npm install

# Bundle app source
COPY . ./

# Documentation & API port
EXPOSE 3000

# Show current folder structure in logs
# RUN ls -al -R

# Run the start command
CMD [ "npm", "run", "start" ]
