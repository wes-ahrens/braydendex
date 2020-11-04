'use strict'

const express = require('express')
const router = express.Router()

const api = require('../app/api')

router.get('/:pokedex', (req,res) => {
    api.getPokemon(req.params.pokedex)
        .then(obj => res.status(200).json(obj))
        .catch(err => res.status(500).json(err))
})

router.get('/:pokedex/colou?r', (req,res) => {
    api.getColour(req.params.pokedex)
        .then(c => res.status(200).json(c))
        .catch(err => res.status(500).json(err))
})

router.get('/:pokedex/sprites', (req,res) => {
    api.getSprites(req.params.pokedex)
        .then(sprites => res.status(200).json(sprites))
        .catch(err => res.status(500).json(err))
})

router.get('/:pokedex/forms', (req,res) => {
    api.getForms(req.params.pokedex)
        .then(forms => res.status(200).json(forms))
        .catch(err => res.status(500).json(err))
})

router.get('/:pokedex/types', (req,res) => {
    api.getTypes(req.params.pokedex)
        .then(types => res.status(200).json(types))
        .catch(err => res.status(500).json(err))
})

router.get('/:pokedex/evolutions', (req,res) => {
    api.getEvolutions(req.params.pokedex)
        .then(evolutions => res.status(200).json(evolutions))
        .catch(err => res.status(500).json(err))
})

module.exports = router
