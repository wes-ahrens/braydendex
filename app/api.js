'use strict'

const Pokedex = require('pokedex-promise-v2')
const pokeapi = new Pokedex({ 'protocol': 'https' })

exports.getPokemon = function (pokemonId) {
  return pokeapi.getPokemonByName(pokemonId)
}

exports.getColour = function (pokemonId) {
  return pokeapi.getPokemonSpeciesByName(pokemonId)
    .then(function (body) {
      return Promise.resolve(body.color.name)
    })
}
