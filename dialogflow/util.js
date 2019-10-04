'use strict'

function handleError (conv, error, message) {
  console.log(error)
  conv.ask(message)
  return Promise.resolve(conv)
}

exports.handleError = handleError
