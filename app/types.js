'use strict'

const typeLookup = [
    "normal",
    "fire",
    "water",
    "grass",
    "electric",
    "ice",
    "fighting",
    "poison",
    "ground",
    "flying",
    "psychic",
    "bug",
    "rock",
    "ghost",
    "dragon",
    "dark",
    "steel",
    "fairy"
]

const effectivenessLookup = [
    {name: "none", multiplier: 0, pogo: 25/64},
    {name: "weak", multiplier: 1/2, pogo: 5/8},
    {name: "effective", multiplier: 1, pogo: 1},
    {name: "super", multiplier: 2, pogo: 8/5}
]

const table = [
    //normal
    [2,2,2,2,2,2,2,2,2,2,2,2,1,0,2,2,1,2],
    //fire
    [2,1,1,3,2,3,2,2,2,2,2,3,1,2,1,2,3,2],
    //water
    [2,3,1,1,2,2,2,2,3,2,2,2,3,2,1,2,2,2],
    //grass
    [2,1,3,1,2,2,2,1,3,1,2,1,3,2,1,2,1,2],
    //electric
    [2,2,3,1,1,2,2,2,0,3,2,2,2,2,1,2,2,2],
    //ice
    [2,1,1,3,2,1,2,2,3,3,2,2,2,2,3,2,1,2],
    //fighting
    [3,2,2,2,2,3,2,1,2,1,1,1,3,0,2,3,3,1],
    //poison
    [2,2,2,3,2,2,2,1,1,2,2,2,1,1,2,2,0,3],
    //ground
    [2,3,2,1,3,2,2,3,2,0,2,1,3,2,2,2,3,2],
    //flying
    [2,2,2,3,1,2,3,2,2,2,2,3,1,2,2,2,1,2],
    //psychic
    [2,2,2,2,2,2,3,3,2,2,1,2,2,2,2,0,1,2],
    //bug
    [2,1,2,3,2,2,1,1,2,1,3,2,2,1,2,3,1,1],
    //rock
    [2,3,2,2,2,3,1,2,1,3,2,3,2,2,2,2,1,2],
    //ghost
    [0,2,2,2,2,2,2,2,2,2,3,2,2,3,2,1,1,2],
    //dragon
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,2,1,0],
    //dark
    [2,2,2,2,2,2,1,2,2,2,3,2,2,3,2,1,1,1],
    //steel
    [2,1,1,2,2,3,2,2,2,2,2,2,3,2,2,2,1,3],
    //fairy
    [2,1,2,2,2,2,3,1,2,2,2,2,2,2,3,3,1,2]
]

exports.getEffectiveMapAgainst = function(vsTypes, pogo=false) {
    return table
        .map(row => {
            return vsTypes.map(type => getMultiplier(row[typeLookup.indexOf(type)], pogo))
                .reduce((a,c) => a*c)
        })
        .reduce((a,c,idx) => {
            a[typeLookup[idx]] = c
            return a
        }, {})
}

function getMultiplier(index, pogo) {
    var o = effectivenessLookup[index]
    return pogo ? o.pogo : o.multiplier
}
    