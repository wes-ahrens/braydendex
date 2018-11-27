'use strict'

// Import the Dialogflow module from the Actions on Google client library.
// const { dialogflow } = require('actions-on-google')
const { WebhookClient } = require('dialogflow-fulfillment')

const PORT = process.env.PORT || 8080
const express = require('express')
const bodyParser = require('body-parser')
const Pokedex = require('pokedex-promise-v2')
const pokeapi = new Pokedex({ 'protocol': 'https' })

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

function pokedexNumber (agent) {
  console.log(agent.parameters)
  const number = agent.parameters.number
  return pokeapi.getPokemonByName(number)
    .then(function (body) {
      agent.add('Pokemon with pokedex number ' + number + ' is ' + body.name)
      agent.setContext({ 'name': 'pokemon', parameters: { 'pokedex': number } })
      return Promise.resolve(agent)
    })
//  return request.get(url)
//    .then(jsonBody => {
//      var body = JSON.parse(jsonBody)
//      agent.add('Pokemon with pokedex number ' + number + ' is ' + body.name)
//      agent.setContext({ 'name': 'pokemon', parameters: { 'pokedex': number } })
//      return Promise.resolve(agent)
//    })
}

function pokedexNumberColour (agent) {
  console.log('Asking for colour...')
  const context = agent.getContext('pokemon')
  console.log(context)
  return pokeapi.getPokemonSpeciesByName(context.parameters.pokedex)
    .then(function (body) {
      agent.add(body.name + ' is ' + body.color.name)
      return Promise.resolve(agent)
    })
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
