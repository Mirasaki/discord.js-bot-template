FROM node:18-alpine

# Create app/working/bot directory
RUN mkdir -p /app
WORKDIR /app

# Install dependencies

# Install app production dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm ci --omit=dev

# Development
# COPY package.json ./
# RUN npm install

# Bundle app source
COPY . ./

# API port
EXPOSE 3000

# Show current folder structure in logs
# RUN ls -al -R

# Run the start command
CMD [ "npm", "run", "start" ]
