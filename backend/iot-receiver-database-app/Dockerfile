# syntax=docker/dockerfile:1
FROM node:18.12.0-alpine

WORKDIR /app/iot-receiver-database-app
COPY ./iot-receiver-database-app .
COPY ./dbConfig.js .
RUN npm install --production
CMD node createDB.js; node syncDataScript.js

