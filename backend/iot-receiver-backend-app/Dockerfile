# syntax=docker/dockerfile:1
FROM node:18.12.0-alpine

WORKDIR /app/iot-receiver-backend-app
COPY ./iot-receiver-backend-app .
COPY ./dbConfig.js .
RUN npm install --production
CMD ["node", "app.js"]
