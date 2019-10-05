'use strict'

const PORT = process.env.PORT || 8080
const express = require('express')
const nunjucks = require('nunjucks')
const bodyParser = require('body-parser')
const { dialogflow } = require('./dialogflow/dispatch')

const server = express()
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))
server.use(express.static('public'))

const templatePath = './templates'
nunjucks.configure(templatePath, {
  autoescape: true,
  express: server
})

// Webhook
server.post('/api', dialogflow)
server.post('/dialogflow/api', dialogflow)

server.get('/index.html', (req, res) => {
  return res.render('index.html')
})

server.get('/about.html', (req, res) => {
  return res.render('about.html')
})

server.get('/status', function (req, res) {
  console.info('GET status request received')
  res.status(200).end()
})

server.listen(PORT, function () {
  console.info('Webhook listening on port ' + PORT)
})

exports.testServer = server
