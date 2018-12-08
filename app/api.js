'use strict'

const Pokedex = require('pokedex-promise-v2')
const pokeapi = new Pokedex({ 'protocol': 'https' })

exports.getPokemon = function (pokemonId) {
  return pokeapi.getPokemonByName(pokemonId)
}

exports.getColour = function (pokemonId) {
  return pokeapi.getPokemonSpeciesByName(pokemonId)
    .then(body => body.color.name)
}

exports.getForms = function (pokemonId) {
  return pokeapi.getPokemonSpeciesByName(pokemonId)
    .then(body => pokeapi.resource(body.varieties.map(value => value.pokemon.url)))
    .then(body => pokeapi.resource(flattenFormUrls(body)))
    .then(body => body.map(value => findNameForLanguage(value.names, 'en', value.pokemon.name)))
}

exports.getTypes = function (pokemonId) {
  return pokeapi.getPokemonByName(pokemonId)
    .then(body => body.types.map(type => type.type.name))
}

exports.getEvolutions = function (pokemonId) {
  return pokeapi.getPokemonSpeciesByName(pokemonId)
    .then(body => pokeapi.resource(body.evolution_chain.url))
    .then(body => body.chain)
}

function flattenFormUrls (array) {
  var urls = []
  array.forEach(function (value) {
    value.forms.forEach(value => {
      urls.push(value.url)
    })
  })
  return urls
}

function findNameForLanguage (array, language, ifempty) {
  for (var i = 0; i < array.length; i++) {
    if (array[i].language.name === language) {
      return array[i].name
    }
  }
  return ifempty
}
