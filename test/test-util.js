const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect

const util = require('../dialogflow/util')

describe('utils', () => {
    describe('getNumberSuffix', function() {
        it('Check suffix for numbers 1-30 and 101-120', function () {
        expect(util.getNumberSuffix(1)).to.equal('st')
        expect(util.getNumberSuffix(2)).to.equal('nd')
        expect(util.getNumberSuffix(3)).to.equal('rd')
        for(var i = 4; i <= 20; i++) {
            expect(util.getNumberSuffix(i)).to.equal('th')
        }
        expect(util.getNumberSuffix(21)).to.equal('st')
        expect(util.getNumberSuffix(22)).to.equal('nd')
        expect(util.getNumberSuffix(23)).to.equal('rd')
        for(var i = 24; i <= 30; i++) {
            expect(util.getNumberSuffix(i)).to.equal('th')
        }
        })
        expect(util.getNumberSuffix(101)).to.equal('st')
        expect(util.getNumberSuffix(102)).to.equal('nd')
        expect(util.getNumberSuffix(103)).to.equal('rd')
        for(var i = 104; i <= 120; i++) {
            expect(util.getNumberSuffix(i)).to.equal('th')
        }
    })

})