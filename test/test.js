const describe = require('mocha').describe
const it = require('mocha').it
const nock = require('nock')
// const assert = require('chai').assert
const expect = require('chai').expect
const api = require('../app/api')
const fs = require('fs')
const path = require('path')
const { testApp } = require('./../index')
const pokemonBulbasaur = require('./data/api/pokemon/bulbasaur')
const pokemonRalts = require('./data/api/pokemon/ralts')
const formsRalts = require('./data/api/pokemon-form/ralts')
const speciesBulbasaur = require('./data/api/pokemon-species/bulbasaur')
const speciesRalts = require('./data/api/pokemon-species/ralts')
const speciesKirlia = require('./data/api/pokemon-species/kirlia')
const speciesGardevoir = require('./data/api/pokemon-species/gardevoir')
const speciesGallade = require('./data/api/pokemon-species/gallade')
const evoRalts = require('./data/api/evolution-chain/ralts')

var chai = require('chai')
var chaiHttp = require('chai-http')
chai.use(chaiHttp)
chai.should()

function getRequestJson (titleOfStaticJson) {
  // load the static json at runtime
  const staticJson = JSON.parse(
    fs.readFileSync(
      // this will look for a file that has the basename matching
      // the name of the it-block. This is done to simplify code,
      // but not neccessary. If you change this line to something
      // else make sure it matches name of the JSON file.

      // eslint-disable-next-line no-invalid-this
      path.join(__dirname, 'data/fulfillment-requests/requests', titleOfStaticJson + '.json')
    )
  )
  return staticJson
}

describe('fulfillment', () => {
  describe('Ask for 150', () => {
    it('Should return Mewtwo', (done) => {
      chai.request(testApp)
        .post('/api')
        .send(getRequestJson('150'))
        .end((err, res) => {
          expect(err).to.be.null
          res.should.have.status(200)
          res.body.should.have.property('fulfillmentText')
          res.body.should.have.property('outputContexts')
          res.body.outputContexts.should.be.a('array')
          res.body.outputContexts.length.should.be.eql(1)
          res.body.outputContexts[0].should.have.property('parameters')
          res.body.outputContexts[0].parameters.should.have.property('pokemonId').eql(150)
          res.body.outputContexts[0].parameters.should.have.property('name').eql('Mewtwo')
          done()
        })
    })
  })
  describe('Ask for Mewtwo', () => {
    it('Should return Mewtwo', (done) => {
      chai.request(testApp)
        .post('/api')
        .send(getRequestJson('Mewtwo'))
        .end((err, res) => {
          expect(err).to.be.null
          res.should.have.status(200)
          res.body.should.have.property('fulfillmentText')
          res.body.should.have.property('outputContexts')
          res.body.outputContexts.should.be.a('array')
          res.body.outputContexts.length.should.be.eql(1)
          res.body.outputContexts[0].should.have.property('parameters')
          res.body.outputContexts[0].parameters.should.have.property('pokemonId').eql(150)
          res.body.outputContexts[0].parameters.should.have.property('name').eql('Mewtwo')
          done()
        })
    })
  })
})

const pokeapi = nock('https://pokeapi.co:443').log(console.log).persist()
describe('api', function () {
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
