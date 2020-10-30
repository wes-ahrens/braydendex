'use strict'

const express = require('express')
const router = express.Router()
const pokemonApi = require('./pokemon')

router.use('/pokemon', pokemonApi)

module.exports = router
