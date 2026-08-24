FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copiar el código fuente
COPY src/ ./src/
COPY public/ ./public/
COPY index.html vite.config.js eslint.config.js ./

USER node

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host"]