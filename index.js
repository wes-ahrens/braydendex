'use strict'

const {
  dialogflow,
  Image,
  List,
  BrowseCarousel,
  BrowseCarouselItem
} = require('actions-on-google')

const PORT = process.env.PORT || 8080
const express = require('express')
const bodyParser = require('body-parser')
const api = require('./app/api')

const app = dialogflow({ debug: true })
app.middleware((conv) => {
  conv.hasScreen =
    conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT')
  conv.hasAudioPlayback =
    conv.surface.capabilities.has('actions.capability.AUDIO_OUTPUT')
  conv.hasWebBrowser =
    conv.surface.capabilities.has('actions.capability.WEB_BROWSER')

  // All require this surface capability check except for media responses
  if (!conv.hasScreen && (conv.intent !== 'media response' || 'media status')) {
    conv.ask('Hi there! Sorry, I\'m afraid you\'ll have to switch to a ' +
      'screen device or select the phone surface in the simulator.')
  }
})

const server = express()
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))

app.intent('name', pokemonName)
app.intent('pokedex number', pokedexNumber)
app.intent('colour', pokemonColour)
app.intent('type', pokemonType)
app.intent('evolution', pokemonEvolution)
app.intent('forms', pokemonForms)
app.intent('show', pokemonSprites)

function pokemonName (conv, params) {
  return selectPokemon(conv, params.Pokemon)
    .catch(error => handleError(conv, error,
      'Sorry, I could not find pokemon ' + params.Pokemon))
}

function pokedexNumber (conv, params) {
  return selectPokemon(conv, params.number)
    .catch(error => handleError(conv, error,
      'Sorry, I could not find pokemon with pokedex number ' + params.number))
}

function selectPokemon (conv, pokemonId) {
  return api.getPokemon(pokemonId)
    .then(pokemonObj => pokemonContexts(conv, pokemonObj))
}

function handleError (conv, error, message) {
  console.log(error)
  conv.ask(message)
  return Promise.resolve(conv)
}

function pokemonContexts (conv, pokemonObj) {
  conv.ask('Pokemon ' + pokemonObj.name + ' is pokedex number ' + pokemonObj.pokemonId)
  conv.contexts.set('pokemon', 5, pokemonObj)
  return Promise.resolve(conv)
}

const spriteMappings = {
  back_female: { friendly: 'Back View - Female', order: 4 },
  back_shiny_female: { friendly: 'Back View (Shiny) - Female', order: 8 },
  back_default: { friendly: 'Back View', order: 2 },
  front_female: { friendly: 'Front View - Female', order: 3 },
  front_shiny_female: { friendly: 'Front View (Shiny) - Female', order: 7 },
  back_shiny: { friendly: 'Back View (Shiny)', order: 6 },
  front_default: { friendly: 'Front View', order: 1 },
  front_shiny: { friendly: 'Front View (Shiny)', order: 5 }
}

function pokemonSprites (conv) {
  console.log('Asking for sprites...')
  const params = conv.contexts.get('pokemon').parameters
  return api.getSprites(params.pokemonId)
    .then(sprites => Object.keys(sprites)
      .sort((a, b) => spriteMappings[a].order - spriteMappings[b].order)
      .filter(key => sprites[key] != null)
      .map(key => {
        console.log('Found sprite ' + spriteMappings[key].friendly + ' : ' + sprites[key])
        return new BrowseCarouselItem({
          title: spriteMappings[key].friendly,
          url: sprites[key],
          image: new Image({
            url: sprites[key],
            alt: 'Image of ' + params.name + ' ' + spriteMappings[key].friendly
          })
        })
      }))
    .then(items => {
      if (!conv.screen) {
        conv.ask('Sorry, Cannot show images on a device without a screen')
      } else if (conv.surface.capabilities.has('actions.capability.WEB_BROWSER')) {
        conv.ask('Here are the images for ' + params.name)
        conv.ask(new BrowseCarousel({
          items: items
        }))
        conv.close('Thanks for using braydendex!')
      } else {
        const itemMap = {}
        items.forEach(item => {
          itemMap[item.title] = {
            synonyms: [item.title],
            title: item.title,
            description: item.title,
            image: item.image
          }
        })
        conv.ask(new List({
          title: 'Here are the images for ' + params.name,
          items: itemMap
        }))
        conv.close('Thanks for using braydendex!')
      }
      return Promise.resolve(conv)
    })
    .catch(error => handleError(conv, error,
      'Sorry, could not retrieve sprites for ' + params.name))
}

function pokemonColour (conv) {
  console.log('Asking for colour...')
  const params = conv.contexts.get('pokemon').parameters
  return api.getColour(params.pokemonId)
    .then(colour => {
      conv.ask(params.name + ' is ' + colour)
      return Promise.resolve(conv)
    })
    .catch(error => handleError(conv, error,
      'Sorry, could not retrieve colour for ' + params.name))
}

function pokemonForms (conv) {
  console.log('Asking if other forms exist...')
  const params = conv.contexts.get('pokemon').parameters
  return api.getForms(params.pokemonId)
    .then(forms => {
      conv.ask('The possible forms are ' + forms.join(' and '))
      return Promise.resolve(conv)
    })
    .catch(function (error) {
      conv.ask(error)
      return Promise.resolve(conv)
    })
}

function pokemonType (conv) {
  console.log('Asking for type...')
  const params = conv.contexts.get('pokemon').parameters
  return api.getTypes(params.pokemonId)
    .then(types => {
      conv.ask(params.name + ' is ' + types.join(' and ') + ' type')
      return Promise.resolve(conv)
    })
}

function pokemonEvolution (conv) {
  console.log('Asking for evolutions...')
  const params = conv.contexts.get('pokemon').parameters
  return api.getEvolutions(params.pokemonId)
    .then(function (chain) {
      conv.ask(createEvolutionString(chain))
      return Promise.resolve(conv)
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
server.post('/api', app)
server.post('/dialogflow/api', app)

server.get('/status', function (req, res) {
  console.info('GET status request received')
  res.status(200).end()
})

server.listen(PORT, function () {
  console.info('Webhook listening on port ' + PORT)
})

exports.testServer = server
