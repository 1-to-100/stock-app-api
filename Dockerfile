# Use Node.js version 20 as the base image
FROM node:22

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --force

# Copy the rest of the application code
COPY . .

RUN npx prisma generate
RUN npm run build

# Copying the sahred dependencies
COPY --from=us-central1-docker.pkg.dev/shared-0c2710c/main/shared-deps /json_secret_export/entrypoint.sh /entrypoint.sh
COPY --from=us-central1-docker.pkg.dev/shared-0c2710c/main/shared-deps /json_secret_export/jq /usr/bin/jq

ENTRYPOINT ["/entrypoint.sh"]

# Run the application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
