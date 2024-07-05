# FROM ghcr.io/puppeteer/puppeteer:22.12.1

# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true \
#     PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable




# WORKDIR /usr/src/app

# COPY package*.json ./
# RUN npm ci
# COPY . .
# CMD ["node", "server.js"]

FROM ghcr.io/puppeteer/puppeteer:22.12.1

ENV PUPPETEER_SKIP_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Install dependencies and Google Chrome
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    --no-install-recommends \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update && apt-get install -y \
    google-chrome-stable \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Verify Google Chrome installation and path
RUN echo "Verifying Chrome installation..." && \
    google-chrome-stable --version && \
    which google-chrome-stable && \
    ls -l /usr/bin/google-chrome-stable

WORKDIR /

COPY package*.json ./
RUN npm ci
COPY . .

CMD ["node", "server.js"]
