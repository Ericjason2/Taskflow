FROM node:20-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm install --production
COPY server/ .
RUN mkdir -p uploads
EXPOSE 5000
CMD ["node", "index.js"]

