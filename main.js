const DotEnv = require('dotenv')
const MQTTPattern = require('mqtt-pattern')
const env = require('./src/env')
const querystring = require('querystring')

// Load config
DotEnv.config()

// Grab configured MQTT, Openfaas, and Express instances
const openfaas = require('./src/openfaas')
const mqtt = require('./src/mqtt')
const express = require('./src/express')

// Setup the topics (openfaas/invoke/function-name and openfaas/result/function-name)
const mqttInvokeTopic = env('MQTT_TOPIC', 'openfaas') + '/invoke/+'
const mqttInvokeTopicFormat = env('MQTT_TOPIC', 'openfaas') + '/invoke/+functionName'
const mqttResultTopic = env('MQTT_TOPIC', 'openfaas') + '/result'

// Wait for a connection
mqtt.on('connect', function () {
  // Subscribe
  mqtt.subscribe(mqttInvokeTopic)

  console.log('Connected to MQTT listening to topic ' + mqttInvokeTopic)
})

// Accept messages
mqtt.on('message', async function (topic, message) {
  // Parse the JSON
  try {
    var data = JSON.parse(message.toString())
  } catch (err) {
    console.error('Incoming MQTT messages must be valid JSON')
    return false
  }

  // Parse the topic
  const topicParams = MQTTPattern.exec(mqttInvokeTopicFormat, topic)

  // Get the function name
  const functionName = topicParams.functionName

  // Process the input and set a default content type
  var input
  let contentType
  if (typeof (data.input) === 'string') {
    input = data.input
    contentType = 'text/plain'
  } else {
    input = JSON.stringify(data.input)
    contentType = 'application/json'
  }

  // Setup defaults and allow overriding
  const headers = Object.assign({
    'Content-Type': contentType
  }, data.headers)

  // Default callback params with access token and function name
  var params = Object.assign({
    access_token: env('WEBHOOK_AUTH'),
    function_name: functionName
  }, data.callbackParams)

  // Build a callback URL
  const callbackUrl = env('WEBHOOK_URL') + ':' +
    env('WEBHOOK_PORT') +
    '?' + querystring.stringify(params)

  console.log('- Invoking ' + functionName + ' on OpenFaas')

  // Invoke the function on OpenFaas
  openfaas.invoke(functionName, input, {
    callbackUrl,
    headers
  })
})

// Handle errors or reconnects
mqtt.on('error', function () {
  console.error('Could not connect to MQTT at: ' + env('MQTT_URL', 'n/a'))
})

mqtt.on('reconnect', function () {
  console.error('Reconnect to MQTT ' + env('MQTT_URL', 'n/a') + ' trying again')
})

// Setup the webhook server
express.post('/', async function (req, res) {
  // Authorize using a token
  if (req.token !== env('WEBHOOK_AUTH')) {
    return res.sendStatus(401)
  }

  var payload

  // Figure out how it was parsed
  if (req.body.constructor.name === 'String') {
    // Plain text
    payload = req.body
  } else if (req.body.constructor.name === 'Object') {
    // JSON
    payload = req.body
  } else if (req.body.constructor.name === 'Buffer') {
    // Raw binary
    // We need to be able to send back params data as well, and since
    // JSON doesn't support binary data, we need to base64 encode them
    payload = req.body.toString('base64')
  } else {
    // We don't understand the body
    console.error('Unable to parse the response body')
    return res.sendStatus(400)
  }

  // Remove the access_token
  delete req.query.access_token

  // Build the actual message
  const message = JSON.stringify({
    params: req.query,
    output: payload
  })

  // Require a function name
  if (typeof req.query.function_name === 'undefined') {
    return res.status(400).send('Bad request - function_name parameter is required')
  }

  // Find the function name to build the topic
  const functionName = req.query.function_name

  // Publish the body Buffer on MQTT
  try {
    console.log('- Publishing result of', functionName)

    await mqtt.publish(mqttResultTopic + '/' + functionName, message)
  } catch (err) {
    console.err(err)
  }

  return res.sendStatus(200)
})

// Start listening
express.listen(env('WEBHOOK_PORT'), env('WEBHOOK_BIND'), null, function () {
  console.log('Webhook server is listening on ' + env('WEBHOOK_BIND') + ':' + env('WEBHOOK_PORT'))
})
