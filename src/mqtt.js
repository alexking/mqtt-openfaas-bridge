const MQTT = require('async-mqtt')
const env = require('./env')

// Connect to MQTT
const mqttOptions = {}

// Optional user and password
if (env('MQTT_USER')) {
  mqttOptions.username = env('MQTT_USER')
}

if (env('MQTT_PASS')) {
  mqttOptions.password = env('MQTT_PASS')
}

console.log('Connecting to MQTT at: ' + env('MQTT_URL', 'n/a'))
module.exports = MQTT.connect(env('MQTT_URL'), mqttOptions)
