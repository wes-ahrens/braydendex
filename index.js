'use strict'

// Import the Dialogflow module from the Actions on Google client library.
// const { dialogflow } = require('actions-on-google')
const { WebhookClient } = require('dialogflow-fulfillment')

const PORT = process.env.PORT || 8080
const express = require('express')
const bodyParser = require('body-parser')
const api = require('./app/api')
const cron = require('node-cron')

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const https = require('https')
cron.schedule('*/29 7-21 * * *', function () {
  https.get('https://braydendex.herokuapp.com/status')
})

let intentMap = new Map()
intentMap.set('name', pokemonName)
intentMap.set('pokedex number', pokedexNumber)
intentMap.set('colour', pokemonColour)
intentMap.set('type', pokemonType)
intentMap.set('evolution', pokemonEvolution)
intentMap.set('forms', pokemonForms)

function pokemonName (agent) {
  return selectPokemon(agent, agent.parameters.Pokemon)
    .catch(error => handleError(agent, error,
      'Sorry, I could not find pokemon ' + agent.parameters.Pokemon))
}

function pokedexNumber (agent) {
  return selectPokemon(agent, agent.parameters.number)
    .catch(error => handleError(agent, error,
      'Sorry, I could not find pokemon with pokedex number ' + agent.parameters.number))
}

function selectPokemon (agent, pokemonId) {
  return api.getPokemon(pokemonId)
    .then(pokemonObj => pokemonContext(agent, pokemonObj))
}

function handleError (agent, error, message) {
  console.log(error)
  agent.add(message)
  return Promise.resolve(agent)
}

function pokemonContext (agent, pokemonObj) {
  agent.add('Pokemon ' + pokemonObj.name + ' is pokedex number ' + pokemonObj.pokemonId)
  agent.setContext({
    'name': 'pokemon',
    parameters: pokemonObj
  })
  return Promise.resolve(agent)
}

function pokemonColour (agent) {
  console.log('Asking for colour...')
  const params = agent.getContext('pokemon').parameters
  return api.getColour(params.pokemonId)
    .then(colour => {
      agent.add(params.name + ' is ' + colour)
      return Promise.resolve(agent)
    })
    .catch(error => handleError(agent, error,
      'Sorry, could not retrieve colour for ' + params.name))
}

function pokemonForms (agent) {
  console.log('Asking if other forms exist...')
  const params = agent.getContext('pokemon').parameters
  return api.getForms(params.pokemonId)
    .then(forms => {
      agent.add('The possible forms are ' + forms.join(' and '))
      return Promise.resolve(agent)
    })
    .catch(function (error) {
      agent.add(error)
      return Promise.resolve(agent)
    })
}

function pokemonType (agent) {
  console.log('Asking for type...')
  const params = agent.getContext('pokemon').parameters
  return api.getTypes(params.pokemonId)
    .then(types => {
      agent.add(params.name + ' is ' + types.join(' and ') + ' type')
      return Promise.resolve(agent)
    })
}

function pokemonEvolution (agent) {
  console.log('Asking for evolutions...')
  const params = agent.getContext('pokemon').parameters
  return api.getEvolutions(params.pokemonId)
    .then(function (chain) {
      agent.add(createEvolutionString(chain))
      return Promise.resolve(agent)
    })
}

function createEvolutionString (node) {
  console.log(node)
  var evolves = node.evolution
  var evoString = node.name
  if (evolves.length === 0) {
    evoString += ' does not evolve'
  } else {
    evoString += ' evolves to '
    var extra = []
    var names = []
    evolves.forEach(function (value) {
      names.push(value.name)
      if (value.evolution.length > 0) {
        extra.push(createEvolutionString(value))
      }
    })
    evoString += names.join(' or ')
    evoString += '. '
    extra.forEach(function (value) {
      evoString += value
    })
  }
  return evoString
}

// Webhook
app.post('/api', function (req, res) {
  console.info('POST request received')
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
})
app.get('/status', function (req, res) {
  console.info('GET status request received')
  res.status(200).end()
})

app.listen(PORT, function () {
  console.info('Webhook listening on port ' + PORT)
})
