# Use the official Node.js 20 image.
# https://hub.docker.com/_/node
FROM node:20-slim

# Create and change to the app directory.
WORKDIR /usr/src/app

# Install pnpm globally. We use pnpm for its efficiency with disk space and installation speed.
RUN npm install -g pnpm

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND pnpm-lock.yaml are copied.
# Copying this first prevents re-running this step when only code changes.
COPY package.json pnpm-lock.yaml* ./

# Install app dependencies using pnpm.
# The --frozen-lockfile flag ensures that we install the exact dependencies from the lockfile.
RUN pnpm install --frozen-lockfile

# Copy the rest of the application's source code from your host to the image.
COPY . .

# Build the Next.js application for production.
# This command compiles the application and optimizes it for the best performance.
RUN pnpm run build

# The "start" script is defined in your `package.json`
# and will run the application in production mode.
CMD ["pnpm", "start"]
