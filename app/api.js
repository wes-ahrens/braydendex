'use strict'

const Pokedex = require('pokedex-promise-v2')
const pokeapi = new Pokedex({ protocol: 'https' })

/**
 * Gets the pokemon object of the given pokedex
 * @param pokedex the pokedex
 * @returns A Promise with the pokemon object
 */
exports.getPokemon = function (pokedex) {
  return pokeapi.getPokemonByName(pokedex)
    .then(body => pokeapi.getPokemonSpeciesByName(body.id))
    .then(body => getPokemonObject(body))
}

/**
 * Gets the primary colour of the given pokedex
 * @param pokedex the pokedex
 * @returns A Promise with the colour
 */
exports.getColour = function (pokedex) {
  return pokeapi.getPokemonSpeciesByName(pokedex)
    .then(body => body.color.name)
}

/**
 * Gets the sprites of the given pokedex
 * @param pokedex the pokedex
 * @returns A Promise with the sprites
 */
exports.getSprites = function (pokedex) {
  return pokeapi.getPokemonByName(pokedex)
    .then(body => body.sprites)
}

/**
 * Gets the forms of the given pokedex
 * @param pokedex the pokedex
 * @returns A Promise with the forms
 */
exports.getForms = function (pokedex) {
  return pokeapi.getPokemonSpeciesByName(pokedex)
    .then(body => pokeapi.resource(body.varieties.map(value => value.pokemon.url)))
    .then(body => pokeapi.resource(flattenFormUrls(body)))
    .then(body => body.map(value => findNameForLanguage(value.names, 'en', value.pokemon.name)))
}

/**
 * Gets the types of the given pokedex
 * @param pokedex the pokedex
 * @returns A Promise with the types
 */
exports.getTypes = function (pokedex) {
  return pokeapi.getPokemonByName(pokedex)
    .then(body => body.types.map(type => type.type.name))
}

/**
 * Gets the evolution chain of the given pokedex
 * @param pokedex the pokedex
 * @returns A Promise with the evolution chain
 */
exports.getEvolutions = function (pokedex) {
  return pokeapi.getPokemonSpeciesByName(pokedex)
    .then(body => pokeapi.resource(body.evolution_chain.url))
    .then(body => transformChainNode(body.chain))
}

function getPokemonObject (speciesBody) {
  return {
    pokedex: speciesBody.id,
    name: findNameForLanguage(speciesBody.names, 'en', speciesBody.name)
  }
}

async function transformChainNode (chain) {
  var promises = [pokeapi.resource(chain.species.url)]
    .concat(chain.evolves_to.map(evo => transformChainNode(evo)))
  const array = await Promise.all(promises)
  var first = array.shift()
  return Promise.resolve({
    name: findNameForLanguage(first.names, 'en', first.name),
    pokedex: first.id,
    evolution: array
  })
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
