'use strict'

const express = require('express')
const router = express.Router()

const api = require('../app/api')

router.get('/:pokedex', (req,res) => {
    api.getPokemon(req.params.pokedex)
        .then(obj => res.status(200).send(obj))
        .catch(err => res.status(500).send(err))
})

module.exports = router
