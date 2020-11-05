'use strict'

const { dialogflow } = require('actions-on-google')
const api = require('../app/api')
const { handleError } = require('./util')
const { pokemonSprites, spritesOption } = require('./sprites')
const { pokemonEvolution } = require('./evolution')
const { counterTypesGood, counterTypesBad } = require('./counters')

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

// Intents
app.intent('name', pokemonName)
app.intent('pokedex number', pokedexNumber)
app.intent('colour', pokemonColour)
app.intent('type', pokemonType)
app.intent('evolution', pokemonEvolution)
app.intent('forms', pokemonForms)
app.intent('show', pokemonSprites)
app.intent('show-selection', spritesOption)
app.intent('counter-types-good', counterTypesGood)
app.intent('counter-types-bad', counterTypesBad)

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

function selectPokemon (conv, pokedex) {
  return api.getPokemon(pokedex)
    .then(pokemonObj => pokemonContexts(conv, pokemonObj))
}

function pokemonContexts (conv, pokemonObj) {
  conv.ask('Pokemon ' + pokemonObj.name + ' is pokedex number ' + pokemonObj.pokedex)
  conv.contexts.set('pokemon', 5, pokemonObj)
  return Promise.resolve(conv)
}

function pokemonColour (conv) {
  console.log('Asking for colour...')
  const params = conv.contexts.get('pokemon').parameters
  return api.getColour(params.pokedex)
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
  return api.getForms(params.pokedex)
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
  return api.getTypes(params.pokedex)
    .then(types => {
      conv.ask(params.name + ' is ' + types.join(' and ') + ' type')
      return Promise.resolve(conv)
    })
}

exports.dialogflow = app
