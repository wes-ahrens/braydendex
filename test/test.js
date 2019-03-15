const describe = require('mocha').describe
const it = require('mocha').it
const nock = require('nock')
const assert = require('chai').assert
const expect = require('chai').expect
const api = require('../app/api')
const pokemonBulbasaur = require('./data/pokemon/bulbasaur')
const pokemonRalts = require('./data/pokemon/ralts')
const formsRalts = require('./data/pokemon-form/ralts')
const speciesBulbasaur = require('./data/pokemon-species/bulbasaur')
const speciesRalts = require('./data/pokemon-species/ralts')
const speciesKirlia = require('./data/pokemon-species/kirlia')
const speciesGardevoir = require('./data/pokemon-species/gardevoir')
const speciesGallade = require('./data/pokemon-species/gallade')
const evoRalts = require('./data/evolution-chain/ralts')

const pokeapi = nock('https://pokeapi.co:443').log(console.log).persist()
describe('API', function () {
  beforeEach(() => {
    pokeapi
      .get(/\/api\/v2\/pokemon\/(1|bulbasaur)\//)
      .reply(200, pokemonBulbasaur)
    pokeapi
      .get(/\/api\/v2\/pokemon\/(280|ralts)\//)
      .reply(200, pokemonRalts)
    pokeapi
      .get('/api/v2/pokemon-form/280/')
      .reply(200, formsRalts)
    pokeapi
      .get(/\/api\/v2\/pokemon-species\/(1|bulbasaur)\//)
      .reply(200, speciesBulbasaur)
    pokeapi
      .get(/\/api\/v2\/pokemon-species\/(280|ralts)\//)
      .reply(200, speciesRalts)
    pokeapi
      .get(/\/api\/v2\/pokemon-species\/(281|kirlia)\//)
      .reply(200, speciesKirlia)
    pokeapi
      .get(/\/api\/v2\/pokemon-species\/(282|gardevoir)\//)
      .reply(200, speciesGardevoir)
    pokeapi
      .get(/\/api\/v2\/pokemon-species\/(475|gallade)\//)
      .reply(200, speciesGallade)
    pokeapi
      .get('/api/v2/evolution-chain/140/')
      .reply(200, evoRalts)
  })
  describe('getPokemon by name', function () {
    it('Should return bulbasaur object', function () {
      return api.getPokemon('bulbasaur')
        .then(response => {
          expect(response.name).to.equal('Bulbasaur')
          expect(response.pokemonId).to.equal(1)
        })
    })
  })
  describe('getPokemon by pokedexNumber', function () {
    it('Should return bulbasaur object', function () {
      return api.getPokemon(1)
        .then(response => {
          expect(response.name).to.equal('Bulbasaur')
          expect(response.pokemonId).to.equal(1)
        })
    })
  })
  describe('evolution of ralts', function () {
    it('Should return ralts evolution chain', function () {
      return api.getEvolutions('ralts')
        .then(response => {
          console.log(response)
          expect(response.name).to.equal('Ralts')
          expect(response.evolution[0].name).to.equal('Kirlia')
          console.log(response.evolution[0].evolution.length)
          console.log(response.evolution[0].evolution[0])
          console.log(response.evolution[0].evolution[1])
          expect(response.evolution[0].evolution[0].name).to.equal('Gardevoir')
          expect(response.evolution[0].evolution[1].name).to.equal('Gallade')
        })
    })
  })
  describe('forms of ralts', function () {
    it('Should return just ralts', function () {
      return api.getForms(280)
        .then(response => {
          expect(response[0]).to.equal('ralts')
        })
    })
  })
})
