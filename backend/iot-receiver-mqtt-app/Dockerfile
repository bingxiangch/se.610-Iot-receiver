# syntax=docker/dockerfile:1
FROM node:18.12.0-alpine

WORKDIR /app/iot-receiver-mqtt-app
COPY ./iot-receiver-mqtt-app .
COPY ./dbConfig.js .
RUN npm install --production
CMD ["node", "mqttHandler.js"]
