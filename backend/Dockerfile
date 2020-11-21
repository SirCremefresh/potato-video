FROM node:13 as builder
WORKDIR /app

COPY ./package*.json ./
RUN npm ci

COPY ./  ./
RUN npm run build:prod


FROM node:15-buster
WORKDIR /app
LABEL maintainer="<donato@wolfisberg.dev>"
LABEL maintainer_name="Donato Wolfisberg"

# Disable prompts from apt.
ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends \
        python \
    && apt-get autoremove -y \
    && apt-get clean -y \
    && curl -L https://yt-dl.org/downloads/latest/youtube-dl \
        -o /usr/local/bin/youtube-dl \
    && rm -rf \
        /tmp/* \
        /var/tmp/* \
        /var/cache/apt/archives/* \
        /var/lib/apt/lists/*

COPY ./package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 8080
CMD ["npm", "run", "start:prod"]
