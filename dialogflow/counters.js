'use strict'

const api = require('../app/api')
const { handleError, getNumberSuffix } = require('./util')

function counterTypesGood (conv) {
    console.log('Asking for good counters...')
    const params = conv.contexts.get('pokemon').parameters
    return api.getGoodCounterTypes(params.pokedex)
        .then(counters => {
            conv.ask(handleCounters(counters, 'best'))
            return Promise.resolve(conv)
        })
        .catch(err => handleError(conv, err, 'Sorry, could not retrieve best counters for ' + params.name))
}

function counterTypesBad (conv) {
    console.log('Asking for bad counters...')
    const params = conv.contexts.get('pokemon').parameters
    return api.getBadCounterTypes(params.pokedex)
        .then(counters => {
            conv.ask(handleCounters(counters, 'worst'))
            return Promise.resolve(conv)
        })
        .catch(err => handleError(conv, err, 'Sorry, could not retrieve worst counters for ' + params.name))
}

function handleCounters(counters, first) {
    return counters.map((c,idx) => 'The ' + getOrderedString(idx+1, first) + ' counter ' + getPluralTypeString(c.types) + ' ' + c.types.join(', ') + '.')
        .join(' ')
}

function getPluralTypeString (arr) {
    return arr.length > 1 ? 'types are' : 'type is'
}

function getOrderedString(num, first) {
    return num == 1 ? first : num + getNumberSuffix(num) + ' ' + first
}

exports.counterTypesGood = counterTypesGood
exports.counterTypesBad = counterTypesBad