'use strict'

const api = require('../app/api')

function counterTypesGood (conv) {
    console.log('Asking for good counters...')
    const params = conv.contexts.get('pokemon').parameters
    return api.getGoodCounterTypes(params.pokedex)
        .then(counters => {
            conv.ask(handleCounters(counters, 'best'))
            return Promise.resolve(conv)
        })
        .catch(err => {
            conv.ask(err)
            return Promise.resolve(conv)
        })
}

function counterTypesBad (conv) {
    console.log('Asking for bad counters...')
    const params = conv.contexts.get('pokemon').parameters
    return api.getBadCounterTypes(params.pokedex)
        .then(counters => {
            conv.ask(handleCounters(counters, 'worst'))
            return Promise.resolve(conv)
        })
        .catch(err => {
            conv.ask(err)
            return Promise.resolve(conv)
        })
}

function handleCounters(counters, first) {
    return counters.map((c,idx) => 'The ' + getOrderedString(idx+1, first) + ' counter ' + getPluralTypeString(c.types) + ' ' + c.types.join(', ') + '.')
        .join(' ')
}

function getPluralTypeString (arr) {
    return arr.length > 1 ? 'types are' : 'type is'
}

function getOrderedString(num, first) {
    return num == 1 ? first : num + getSuffix(num) + ' ' + first
}

function getSuffix(num) {
    var a = ("" + num).split("").reverse()
    if(a[1] != "1") {
        switch(a[0]) {
            case "1": return "st"
            case "2": return "nd"
            case "3": return "rd"
        }
    }
    return "th"
}

exports.counterTypesGood = counterTypesGood
exports.counterTypesBad = counterTypesBad