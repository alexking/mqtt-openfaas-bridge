const express = require('express')
const bodyParser = require('body-parser')
const bearerToken = require('express-bearer-token')

var app = express()

// Support text and json
app.use(bodyParser.text())
app.use(bodyParser.json())

// Handle anything else as raw binary
app.use(bodyParser.raw({ type: '*/*' }))

// We'd like to parse out a token
app.use(bearerToken())

// Report errors
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.sendStatus(500)
  next()
})

module.exports = app
