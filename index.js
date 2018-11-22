'use strict';

// Import the Dialogflow module from the Actions on Google client library.
const {dialogflow} = require('actions-on-google');

// Instantiate the Dialogflow client.
const app = dialogflow({debug: true});

// Handle the Dialogflow intent named 'pokedex number'.
// The intent collects a parameter named 'number'.
app.intent('pokedex number', (conv, {number}) => {
    var rp = require('request-promise-native');

    var options = {
      uri: 'https://pokeapi.co/api/v2/pokemon/'+number,
      json: true
    }
    return rp(options)
      .then( response => {
        console.log( 'response:', JSON.stringify(response, null, 1) );
	var value = response.name;
	return conv.close('Pokemon with pokedex number ' + number + ' is ' + value);
    });

});

// Set the DialogflowApp object to handle the HTTPS POST request.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
