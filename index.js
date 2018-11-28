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

let intentMap = new Map()
intentMap.set('pokemon name', pokemonName)
intentMap.set('pokedex number', pokedexNumber)
intentMap.set('pokemon colour', pokemonColour)

function pokemonName (agent) {
  return pokeapi.getPokemonByName(agent.parameters.Pokemon)
    .then(function (body) {
      agent.add('Pokemon ' + body.name + ' is pokedex number ' + body.id)
      agent.setContext({ 'name': 'pokemon', parameters: { 'pokedex': body.id } })
      return Promise.resolve(agent)
    })
}

function pokedexNumber (agent) {
  return pokeapi.getPokemonByName(agent.parameters.number)
    .then(function (body) {
      agent.add('Pokemon ' + body.name + ' is pokedex number ' + body.id)
      agent.setContext({ 'name': 'pokemon', parameters: { 'pokedex': body.id } })
      return Promise.resolve(agent)
    })
}

function pokemonColour (agent) {
  console.log('Asking for colour...')
  return pokeapi.getPokemonSpeciesByName(agent.getContext('pokemon').parameters.pokedex)
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
  console.log('query:' + agent.query)
  console.log('session:' + agent.session)

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
