'use strict'

const api = require('../app/api')

function counterTypesGood (conv) {
    console.log('Asking for good counters...')
    const params = conv.contexts.get('pokemon').parameters
    const multiplierArr = api.getGoodCounterTypes(params.pokedex)   
    conv.ask('The types blah and blah are good against ' + params.name)
    return Promise.resolve(conv)
}

function counterTypesBad() {
    console.log('Asking for bad counters...')
    const params = conv.contexts.get('pokemon').parameters
    const multiplierArr = api.getBadCounterTypes(params.pokedex)   
    conv.ask('The types blah and blah are bad against ' + params.name)
    return Promise.resolve(conv)
}

exports.counterTypesGood = counterTypesGood
exports.counterTypesBad = counterTypesBad