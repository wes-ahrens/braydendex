const describe = require('mocha').describe
const it = require('mocha').it
const nock = require('nock')
const expect = require('chai').expect
const api = require('../app/api')
const types = require('../app/types')
const fs = require('fs')
const path = require('path')
const { testServer } = require('../index')
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
  return JSON.parse(
    fs.readFileSync(
      path.join(__dirname, 'data/fulfillment-requests', titleOfStaticJson + '.json')
    )
  )
}

describe('fulfillment', () => {
  describe('Ask for 150', () => {
    it('Should return Mewtwo', (done) => {
      chai.request(testServer)
        .post('/dialogflow/api')
        .send(getRequestJson('150'))
        .end((err, res) => {
          expect(err).to.be.null
          res.should.have.status(200)
          checkForPokemon(res, 150, 'Mewtwo')
          done()
        })
    })
  })
  describe('Ask for Mewtwo', () => {
    it('Should return Mewtwo', (done) => {
      chai.request(testServer)
        .post('/dialogflow/api')
        .send(getRequestJson('Mewtwo'))
        .end((err, res) => {
          expect(err).to.be.null
          res.should.have.status(200)
          checkTextToSpeech(res, 'Pokemon Mewtwo is pokedex number 150')
          checkForPokemon(res, 150, 'Mewtwo')
          done()
        })
    })
  })
  describe('Ask for Mewtwo->type', () => {
    it('Should return Mewtwo is psychic', (done) => {
      chai.request(testServer)
        .post('/dialogflow/api')
        .send(getRequestJson('150-type'))
        .end((err, res) => {
          expect(err).to.be.null
          res.should.have.status(200)
          checkTextToSpeech(res, 'Mewtwo is psychic type')
          done()
        })
    })
  })
  describe('Ask for Mewtwo->colour', () => {
    it('Should return Mewtwo is purple', (done) => {
      chai.request(testServer)
        .post('/dialogflow/api')
        .send(getRequestJson('150-colour'))
        .end((err, res) => {
          expect(err).to.be.null
          res.should.have.status(200)
          checkTextToSpeech(res, 'Mewtwo is purple')
          done()
        })
    })
  })
  describe('Ask for Mewtwo->evolution', () => {
    it('Should return Mewtwo does not evolve', (done) => {
      chai.request(testServer)
        .post('/dialogflow/api')
        .send(getRequestJson('150-evolution'))
        .end((err, res) => {
          expect(err).to.be.null
          res.should.have.status(200)
          checkTextToSpeech(res, 'Mewtwo does not evolve')
          done()
        })
    })
  })
  describe('Ask for Mewtwo->forms', () => {
    it('Should return Mega Mewtwo X and Mega Mewtwo Y', (done) => {
      chai.request(testServer)
        .post('/dialogflow/api')
        .send(getRequestJson('150-forms'))
        .end((err, res) => {
          expect(err).to.be.null
          res.should.have.status(200)
          checkTextToSpeech(res, 'The possible forms are mewtwo and Mega Mewtwo X and Mega Mewtwo Y')
          done()
        })
    })
  })
  describe('Ask for Mewtwo->show on phone', () => {
    it('Should return images of Mewtwo', (done) => {
      chai.request(testServer)
        .post('/dialogflow/api')
        .send(getRequestJson('150-show-phone'))
        .end((err, res) => {
          expect(err).to.be.null
          res.should.have.status(200)
          res.body.should.have.property('payload')
          res.body.payload.should.have.property('google')
          res.body.payload.google.should.have.property('richResponse')
          res.body.payload.google.richResponse.should.have.property('items')
          res.body.payload.google.richResponse.items.should.be.a('array')
          done()
        })
    })
  })
  describe('Ask for Mewtwo->show on display', () => {
    it('Should return images of Mewtwo', (done) => {
      chai.request(testServer)
        .post('/dialogflow/api')
        .send(getRequestJson('150-show-display'))
        .end((err, res) => {
          expect(err).to.be.null
          res.should.have.status(200)
          res.body.should.have.property('payload')
          res.body.payload.should.have.property('google')
          res.body.payload.google.should.have.property('richResponse')
          res.body.payload.google.richResponse.should.have.property('items')
          res.body.payload.google.richResponse.items.should.be.a('array')
          done()
        })
    })
  })
  describe('Ask for Mewtwo->show on display->select', () => {
    it('Should return images of Mewtwo', (done) => {
      chai.request(testServer)
        .post('/dialogflow/api')
        .send(getRequestJson('150-show-display-select'))
        .end((err, res) => {
          expect(err).to.be.null
          res.should.have.status(200)
          done()
        })
    })
  })
  describe('Ask for Castform->Forms', () => {
    it('Should return forms of Castform', (done) => {
      chai.request(testServer)
        .post('/dialogflow/api')
        .send(getRequestJson('castform-forms'))
        .end((err, res) => {
          expect(err).to.be.null
          res.should.have.status(200)
          checkTextToSpeech(res, 'The possible forms are castform and Sunny Castform and Rainy Castform and Snowy Castform')
          done()
        })
    })
  })
  describe('Ask for Ralts->Evolution', () => {
    it('Should return evolutions of Ralts', (done) => {
      chai.request(testServer)
        .post('/dialogflow/api')
        .send(getRequestJson('ralts-evolution'))
        .end((err, res) => {
          expect(err).to.be.null
          res.should.have.status(200)
          checkTextToSpeech(res, 'Ralts evolves to Kirlia. Kirlia evolves to Gardevoir or Gallade. ')
          done()
        })
    })
  })
  describe('Ask for 150->good counters', () => {
    it('Should return good counters for Mewtwo', (done) => {
      chai.request(testServer)
        .post('/dialogflow/api')
        .send(getRequestJson('150-good-counters'))
        .end((err, res) => {
          expect(err).to.be.null
          res.should.have.status(200)
          checkTextToSpeech(res, 'The best counter types are bug, ghost, dark.')
          done()
        })
    })
  })
  describe('Ask for salamence->bad counters', () => {
    it('Should return bad counters for Salamence', (done) => {
      chai.request(testServer)
        .post('/dialogflow/api')
        .send(getRequestJson('salamence-bad-counters'))
        .end((err, res) => {
          expect(err).to.be.null
          res.should.have.status(200)
          checkTextToSpeech(res, 'The worst counter type is ground. The 2nd worst counter type is grass. The 3rd worst counter types are fire, water, fighting, bug.')
          done()
        })
    })
  })
  describe('Ask for 1000', () => {
    it('Should return error', (done) => {
      chai.request(testServer)
        .post('/dialogflow/api')
        .send(getRequestJson('1000'))
        .end((err, res) => {
          expect(err).to.be.null
          res.should.have.status(200)
          checkTextToSpeech(res, 'Sorry, I could not find pokemon with pokedex number 1000')
          done()
        })
    })
  })
})

function checkTextToSpeech (res, string) {
  res.body.should.have.property('payload')
  res.body.payload.should.have.property('google')
  res.body.payload.google.should.have.property('richResponse')
  res.body.payload.google.richResponse.should.have.property('items')
  res.body.payload.google.richResponse.items.length.should.be.eql(1)
  res.body.payload.google.richResponse.items[0].should.have.property('simpleResponse')
  res.body.payload.google.richResponse.items[0].simpleResponse.should.have.property('textToSpeech')
  res.body.payload.google.richResponse.items[0].simpleResponse.textToSpeech.should.be.eql(string)
}

function checkForPokemon (res, id, name) {
  res.body.should.have.property('outputContexts')
  res.body.outputContexts.length.should.be.eql(1)
  res.body.outputContexts[0].should.have.property('parameters')
  res.body.outputContexts[0].parameters.should.have.property('pokedex').eql(id)
  res.body.outputContexts[0].parameters.should.have.property('name').eql(name)
}

const pokeapi = nock('https://pokeapi.co:443').persist()
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
    pokeapi
      .get('/api/v2/pokemon/1000/')
      .reply(404, 'Not Found')
  })
  describe('getPokemon by name', function () {
    it('Should return bulbasaur object', function () {
      return api.getPokemon('bulbasaur')
        .then(response => {
          expect(response.name).to.equal('Bulbasaur')
          expect(response.pokedex).to.equal(1)
        })
    })
  })
  describe('getPokemon by pokedexNumber', function () {
    it('Should return bulbasaur object', function () {
      return api.getPokemon(1)
        .then(response => {
          expect(response.name).to.equal('Bulbasaur')
          expect(response.pokedex).to.equal(1)
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
