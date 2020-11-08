'use strict'

const api = require('../app/api')

async function pokemonEvolution (conv) {
  console.log('Asking for evolutions...')
  const params = conv.contexts.get('pokemon').parameters
  const chain = await api.getEvolutions(params.pokedex)
  conv.ask(createEvolutionString(chain))
  return Promise.resolve(conv)
}
exports.pokemonEvolution = pokemonEvolution

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
