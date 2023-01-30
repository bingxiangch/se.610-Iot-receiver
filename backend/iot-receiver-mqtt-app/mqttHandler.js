const mqtt = process.env.JEST_WORKER_ID !== undefined ? require("./tests/mockMqtt") : require('mqtt');
const dotenv = require('dotenv')
const winston = require('winston')
const { insertShortTermDeviceData } = process.env.JEST_WORKER_ID !== undefined ? require("./tests/mockQueries") : require('./dbManager');

// Setting up logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'mqtt_error.log', level: 'error' })
  ]
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple()
    })
  )
}

// Loading environment variables
dotenv.config()
logger.info('Environment variables loaded.')

// Checking that configuration is valid.
if (isValidConfig()) {
  // Constructing URL of MQTT Broker
  const connectionUrl = `mqtt://${process.env.MQTT_HOST}:${process.env.MQTT_PORT}`
  // Declare client options
  const options = {
    clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000
  }
  // Connecting to broker
  const client = mqtt.connect(connectionUrl, options)

  // Setting event handlers
  client.on('connect', onConnect)
  client.on('reconnect', onReconnect)
  client.on('error', onError)
  client.on('message', onMessage)
  client.on('close', onClose)

  function onConnect() {
    logger.info('Connected to MQTT Broker')
    // When connected, subscribe to topic
    client.subscribe([process.env.MQTT_TOPIC], () => {
      logger.info(`Subscribed to topic '${process.env.MQTT_TOPIC}'`)
    })
  }

  function onReconnect(err) {
    logger.info('Reconnecting to MQTT Broker')
    if (err) {
      logger.error(err)
    }
  }

  function onError(err) {
    logger.error('Error encountered.')
    if (err) {
      logger.error(err)
    }
  }

  function onMessage(topic, payload) {
    insertShortTermDeviceData(JSON.parse(payload))
  }

  function onClose() {
    logger.info('Closing connection to MQTT Broker.')
  }
}

// Checks if required environment variables have been provided.
function isValidConfig() {
  // Keys that are needed to run the program.
  const requiredKeys = ['MQTT_HOST', 'MQTT_PORT', 'MQTT_TOPIC']
  // Check that every key is present in environment variables.
  const allKeysPresent = requiredKeys.every((value) => {
    return value in process.env
  })
  return allKeysPresent
}
