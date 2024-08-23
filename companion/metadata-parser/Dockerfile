FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install required system packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    graphicsmagick \
    ghostscript \
    && rm -rf /var/lib/apt/lists/*

# Set up the application
COPY . /app
WORKDIR /app

# Install dependencies
RUN pnpm install

# Build the application
RUN pnpm build

# Expose the container port
EXPOSE 8000

CMD [ "pnpm", "start" ]
