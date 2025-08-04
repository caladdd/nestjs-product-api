FROM node:22

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the source code
COPY . .

# Expose the NestJS development port
EXPOSE 3000

# Start the app in development mode
CMD ["npm", "run", "start:dev"]