'use strict'

const api = require('../app/api')
const { handleError, getNumberSuffix } = require('./util')

async function counterTypesGood (conv) {
    console.log('Asking for good counters...')
    const params = conv.contexts.get('pokemon').parameters
    try {
        const counters = await api.getGoodCounterTypes(params.pokedex)
        conv.ask(handleCounters(counters, 'best'))
        return Promise.resolve(conv)
    } catch (err) {
        return await handleError(conv, err, 'Sorry, could not retrieve best counters for ' + params.name)
    }
}
exports.counterTypesGood = counterTypesGood

async function counterTypesBad (conv) {
    console.log('Asking for bad counters...')
    const params = conv.contexts.get('pokemon').parameters
    try {
        const counters = await api.getBadCounterTypes(params.pokedex)
        conv.ask(handleCounters(counters, 'worst'))
        return Promise.resolve(conv)
    } catch (err) {
        return await handleError(conv, err, 'Sorry, could not retrieve worst counters for ' + params.name)
    }
}
exports.counterTypesBad = counterTypesBad

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

