'use strict'

function handleError (conv, error, message) {
  console.log(error)
  conv.ask(message)
  return Promise.resolve(conv)
}

function getNumberSuffix(num) {
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

exports.handleError = handleError
exports.getNumberSuffix = getNumberSuffix
