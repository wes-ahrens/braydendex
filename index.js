'use strict'

const PORT = process.env.PORT || 8080
const express = require('express')
const bodyParser = require('body-parser')
const { dialogflow } = require('./dialogflow/dispatch')

const server = express()
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))
server.use(express.static('public'))

// Webhook
server.post('/api', dialogflow)
server.post('/dialogflow/api', dialogflow)

server.get('/status', function (req, res) {
  console.info('GET status request received')
  res.status(200).end()
})

server.listen(PORT, function () {
  console.info('Webhook listening on port ' + PORT)
})

exports.testServer = server
