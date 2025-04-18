# Use Node 18 runtime
FROM node:18

# Set working directory
WORKDIR /app

# Copy files
COPY package*.json ./
RUN npm install
COPY . .

# Expose App Runner default port
EXPOSE 8080

# Run the app
CMD ["npm", "start"]
