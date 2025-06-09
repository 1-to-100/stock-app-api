# Use Node.js version 20 as the base image
FROM node:lts-alpine3.22

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --force

COPY . .

# Generate Prisma client (if using Prisma)
RUN npx prisma generate

# Build the NestJS application
RUN npm run build

# Run database migrations and start the application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]