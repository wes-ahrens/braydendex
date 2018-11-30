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

function pokemonForms (agent) {
  console.log('Asking if other forms exist...')
  var pokemonName
  return pokeapi.getPokemonSpeciesByName(agent.getContext('pokemon').parameters.pokedex)
    .then(function (body) {
      var pokemonUrls = []
      pokemonName = body.name
      body.varieties.forEach(function (value) {
        if (value.is_default === false) {
          pokemonUrls.push(value.pokemon.url)
        }
      })
      if (pokemonUrls.length === 0) {
        agent.add(pokemonName + ' has no other forms')
        return Promise.resolve(agent)
      }
      return pokeapi.resource(pokemonUrls)
        .then(function (pokemonBody) {
          var formUrls = []
          pokemonBody.forEach(function (value) {
            formUrls.push(value.forms[0].url)
          })
          if (formUrls.length === 0) {
            agent.add(pokemonName + ' has no other forms')
            return Promise.resolve(agent)
          }
          return pokeapi.resource(formUrls)
            .then(function (formBody) {
              var forms = []
              formBody.forEach(function (value) {
                var name = findNameForLanguage(value.names, 'en')
                if (name != null) {
                  forms.push(name)
                }
              })
              if (forms.length === 0) {
                agent.add(pokemonName + ' has no other forms')
              } else {
                var formsString = forms.join(' and ')
                var pluralString1 = 'form'
                var pluralString2 = ' is '
                if (forms.length > 1) {
                  pluralString1 += 's'
                  pluralString2 = ' are '
                }
                agent.add('The other possible ' + pluralString1 + ' of ' + pokemonName + pluralString2 + formsString)
              }
              return Promise.resolve(agent)
            })
        })
    })
}

function findNameForLanguage (array, language) {
  for (var i = 0; i < array.length; i++) {
    if (array[i].language.name === language) {
      return array[i].name
    }
  }
  return null
}

function pokemonType (agent) {
  console.log('Asking for type...')
  return pokeapi.getPokemonByName(agent.getContext('pokemon').parameters.pokedex)
    .then(function (body) {
      var typestr = ''
      for (var i = 0; i < body.types.length; i++) {
        if (typestr !== '') {
          typestr += ' and '
        }
        typestr += body.types[i].type.name + ' type'
      }
      agent.add(body.name + ' is ' + typestr)
      return Promise.resolve(agent)
    })
}

function pokemonEvolution (agent) {
  console.log('Asking for evolutions...')
  return pokeapi.getPokemonSpeciesByName(agent.getContext('pokemon').parameters.pokedex)
    .then(function (body) {
      return pokeapi.resource(body.evolution_chain.url)
        .then(function (evoBody) {
          console.log(evoBody)
          var chain = evoBody.chain
          agent.add(createEvolutionString(chain))
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
app.get('/status', function (req, res) {
  console.info('GET status request received')
  res.status(200).end()
})

app.listen(PORT, function () {
  console.info('Webhook listening on port ' + PORT)
})
