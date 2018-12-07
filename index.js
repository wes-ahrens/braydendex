'use strict'

// Import the Dialogflow module from the Actions on Google client library.
// const { dialogflow } = require('actions-on-google')
const { WebhookClient } = require('dialogflow-fulfillment')

const PORT = process.env.PORT || 8080
const express = require('express')
const bodyParser = require('body-parser')
const api = require('./app/api')
const Pokedex = require('pokedex-promise-v2')
const pokeapi = new Pokedex({ 'protocol': 'https' })

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const https = require('https')
setInterval(function () {
  https.get('https://braydendex.herokuapp.com/status')
}, 1200000) // every 20 minutes

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
    .then(body => pokemonContext(agent, body))
}

function handleError (agent, error, message) {
  console.log(error)
  agent.add(message)
  return Promise.resolve(agent)
}

function pokemonContext (agent, body) {
  agent.add('Pokemon ' + body.name + ' is pokedex number ' + body.id)
  agent.setContext({
    'name': 'pokemon',
    parameters: {
      'pokedex': body.id,
      'name': body.name
    }
  })
  return Promise.resolve(agent)
}

function pokemonColour (agent) {
  console.log('Asking for colour...')
  const params = agent.getContext('pokemon').parameters
  return api.getColour(params.pokedex)
    .then(colour => {
      agent.add(params.name + ' is ' + colour)
      return Promise.resolve(agent)
    })
    .catch(error => handleError(agent, error,
      'Sorry, could not retrieve colour for ' + params.name))
}

function pokemonForms (agent) {
  console.log('Asking if other forms exist...')
  return pokeapi.getPokemonSpeciesByName(agent.getContext('pokemon').parameters.pokedex)
    .then(function (body) {
      var resources = body.varieties.map(value => value.pokemon.url)
      console.log('Pokemon URLs:')
      console.log(resources)
      return pokeapi.resource(resources)
    })
    .then(function (pokemonBody) {
      var formUrls = []
      pokemonBody.forEach(function (value) {
        value.forms.forEach(value => {
          formUrls.push(value.url)
        })
      })
      console.log('Form URLs:')
      console.log(formUrls)
      return pokeapi.resource(formUrls)
    })
    .then(function (formBody) {
      var forms = formBody.map(value => findNameForLanguage(value.names, 'en', value.pokemon.name))
      console.log('Forms:')
      console.log(forms)
      var formsString
      if (forms.length === 1) {
        formsString = forms[0] + ' has only one form'
      } else {
        formsString = forms.join(' and ')
      }
      agent.add('The possible forms are ' + formsString)
      return Promise.resolve(agent)
    })
    .catch(function (error) {
      agent.add(error)
      return Promise.resolve(agent)
    })
}

function findNameForLanguage (array, language, ifempty) {
  for (var i = 0; i < array.length; i++) {
    if (array[i].language.name === language) {
      return array[i].name
    }
  }
  return ifempty
}

function pokemonType (agent) {
  console.log('Asking for type...')
  return pokeapi.getPokemonByName(agent.getContext('pokemon').parameters.pokedex)
    .then(function (body) {
      const types = body.types.map(type => type.type.name)
      var typestr = types.join(' and ')
      agent.add(body.name + ' is ' + typestr + ' type')
      return Promise.resolve(agent)
    })
}

function pokemonEvolution (agent) {
  console.log('Asking for evolutions...')
  return pokeapi.getPokemonSpeciesByName(agent.getContext('pokemon').parameters.pokedex)
    .then(function (body) {
      return pokeapi.resource(body.evolution_chain.url)
        .then(function (evoBody) {
          agent.add(createEvolutionString(evoBody.chain))
          return Promise.resolve(agent)
        })
    })
}

function createEvolutionString (node) {
  console.log(node)
  var evolves = node.evolves_to
  var evoString = node.species.name
  if (evolves.length === 0) {
    evoString += ' does not evolve'
  } else {
    evoString += ' evolves to '
    var extra = []
    var names = []
    evolves.forEach(function (value) {
      names.push(value.species.name)
      if (value.evolves_to.length > 0) {
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
app.post('/', function (req, res) {
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
