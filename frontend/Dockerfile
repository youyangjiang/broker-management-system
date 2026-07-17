FROM node:22-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN mkdir -p .next/standalone/.next && cp -r .next/static .next/standalone/.next/static

CMD ["sh", "-c", "cd .next/standalone && HOSTNAME=0.0.0.0 PORT=${PORT:-3000} node server.js"]
