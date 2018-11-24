'use strict'

// Import the Dialogflow module from the Actions on Google client library.
// const { dialogflow } = require('actions-on-google')
const { WebhookClient } = require('dialogflow-fulfillment')

const PORT = process.env.PORT || 8080
const express = require('express')
const bodyParser = require('body-parser')
const jsonpath = require('jsonpath')

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

function pokedexNumber (agent) {
  console.log(agent.parameters)
  const number = agent.parameters.number
  const request = require('request-promise-native')
  const url = 'https://pokeapi.co/api/v2/pokemon/' + number
  console.log(url)
  return request.get(url)
    .then(jsonBody => {
      var body = JSON.parse(jsonBody)
      agent.add('Pokemon with pokedex number ' + number + ' is ' + body.name)
      return Promise.resolve(agent)
    })
}

function pokedexNumberColour (agent) {
  console.log(jsonpath.query(agent.contexts, '$[?@.name=="pokedexnumber-followup"].parameters'))
  console.log('asking for colour')
  agent.add('Not sure what colour the pokemon is')
}

function WebhookProcessing (req, res) {
  const agent = new WebhookClient({ request: req, response: res })
  console.log('agentVersion:' + agent.agentVersion)
  console.log('intent:' + agent.intent)
  console.log('action:' + agent.action)
  console.log('parameters:')
  console.log(agent.parameters)
  console.log('contexts:')
  console.log(agent.contexts)
  console.log('requestSource:' + agent.requestSource)
  console.log('originalRequest:')
  console.log(agent.originalRequest)
  console.log('query:' + agent.query)
  console.log('locale:' + agent.locale)
  console.log('session:' + agent.session)

  let intentMap = new Map()
  intentMap.set('pokedex number', pokedexNumber)
  intentMap.set('pokedex number_colour', pokedexNumberColour)
  agent.handleRequest(intentMap)
}

// Webhook
app.post('/', function (req, res) {
  console.info('POST request received')
  WebhookProcessing(req, res)
})

app.listen(PORT, function () {
  console.info('Webhook listening on port ' + PORT)
})
