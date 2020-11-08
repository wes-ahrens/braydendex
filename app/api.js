'use strict'

const Pokedex = require('pokedex-promise-v2')
const pokeapi = new Pokedex({ protocol: 'https' })
const typesApi = require('./types')

/**
 * Gets the pokemon object of the given pokedex
 * @param pokedex the pokedex
 * @returns A Promise with the pokemon object
 */
async function getPokemon (pokedex) {
  return await pokeapi.getPokemonByName(pokedex)
    .then(body => pokeapi.getPokemonSpeciesByName(body.id))
    .then(body => getPokemonObject(body))
}
exports.getPokemon = getPokemon

/**
 * Gets the primary colour of the given pokedex
 * @param pokedex the pokedex
 * @returns A Promise with the colour
 */
async function getColour (pokedex) {
  const body = await pokeapi.getPokemonSpeciesByName(pokedex)
  return body.color.name
}
exports.getColour = getColour

/**
 * Gets the sprites of the given pokedex
 * @param pokedex the pokedex
 * @returns A Promise with the sprites
 */
async function getSprites (pokedex) {
  const body = await pokeapi.getPokemonByName(pokedex)
  return body.sprites
}
exports.getSprites = getSprites

/**
 * Gets the forms of the given pokedex
 * @param pokedex the pokedex
 * @returns A Promise with the forms
 */
async function getForms (pokedex) {
  return await pokeapi.getPokemonSpeciesByName(pokedex)
    .then(body => pokeapi.resource(body.varieties.map(value => value.pokemon.url)))
    .then(body => pokeapi.resource(flattenFormUrls(body)))
    .then(body => body.map(value => findNameForLanguage(value.names, 'en', value.pokemon.name)))
}
exports.getForms = getForms

/**
 * Gets the types of the given pokedex
 * @param pokedex the pokedex
 * @returns A Promise with the types
 */
async function getTypes (pokedex) {
  return await pokeapi.getPokemonByName(pokedex)
    .then(body => body.types.map(type => type.type.name))
}
exports.getTypes = getTypes

/**
 * Gets the evolution chain of the given pokedex
 * @param pokedex the pokedex
 * @returns A Promise with the evolution chain
 */
async function getEvolutions (pokedex) {
  return await pokeapi.getPokemonSpeciesByName(pokedex)
    .then(body => pokeapi.resource(body.evolution_chain.url))
    .then(body => transformChainNode(body.chain))
}
exports.getEvolutions = getEvolutions

/**
 * Gets an effectiveness map against the types of the given pokedex
 * @param pokedex the pokedex
 * @param {boolean} pogo whether to use pogo multipliers
 */
async function getEffectivenessMapAgainst (pokedex, pogo=false) {
  return await getTypes(pokedex)
    .then(types => typesApi.getEffectiveMapAgainst(types, pogo))
}
exports.getEffectivenessMapAgainst = getEffectivenessMapAgainst

/**
 * Gets a list of types that are more than effective against the types
 * of the given pokedex
 * @param pokedex the pokedex
 * @param {boolean} pogo whether to use pogo multipliers
 */
async function getGoodCounterTypes (pokedex, pogo=false) {
  return await getTypes(pokedex)
    .then(types => typesApi.getGoodCounterTypes(types, pogo))
}
exports.getGoodCounterTypes = getGoodCounterTypes

/**
 * Gets a list of types that are less than effective against the types
 * of the given pokedex
 * @param pokedex the pokedex
 * @param {boolean} pogo whether to use pogo multipliers
 */
async function getBadCounterTypes (pokedex, pogo=false) {
  return await getTypes(pokedex)
    .then(types => typesApi.getBadCounterTypes(types, pogo))
}
exports.getBadCounterTypes = getBadCounterTypes

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
