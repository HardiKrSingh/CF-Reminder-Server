FROM ghcr.io/puppeteer/puppeteer:22.12.1

ENV PUPPETEER_SKIP_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH=google-chrome-stable

WORKDIR /


COPY package*.json ./
RUN npm ci
COPY . .
CMD ["node", "server.js"]