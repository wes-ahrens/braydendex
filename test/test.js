const describe = require('mocha').describe
const it = require('mocha').it
const nock = require('nock')
const assert = require('chai').assert
const expect = require('chai').expect
const api = require('../app/api')
const bulbasaur = require('./data/bulbasaur')

describe('API', function () {
  beforeEach(() => {
    nock('https://pokeapi.co:443')
      .log(console.log)
      .persist()
      .get('/api/v2/pokemon/bulbasaur/')
      .reply(200, bulbasaur)
    nock('https://pokeapi.co:443')
      .log(console.log)
      .persist()
      .get('/api/v2/pokemon/1/')
      .reply(200, bulbasaur)
  })
  describe('getPokemon by name', function () {
    it('Should return bulbasaur object', function () {
      return api.getPokemon('bulbasaur')
        .then(response => {
          expect(response.name).to.equal('bulbasaur')
        })
    })
  })
  describe('getPokemon by pokedexNumber', function () {
    it('Should return bulbasaur object', function () {
      return api.getPokemon(1)
        .then(response => {
          expect(response.name).to.equal('bulbasaur')
        })
    })
  })
})