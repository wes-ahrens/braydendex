'use strict';

// Import the Dialogflow module from the Actions on Google client library.
const {dialogflow} = require('actions-on-google');
const {WebhookClient} = require('dialogflow-fulfillment');

const PORT = process.env.PORT || 8080
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

function pokedexNumber (agent) {
	console.log(agent.parameters);
	const number = agent.parameters.number;
	const request = require('request-promise-native');
	const url = 'https://pokeapi.co/api/v2/pokemon/'+number;
	console.log(url);
	return request.get(url)
		.then( jsonBody => {
			agent.add('Pokemon with pokedex number ' + number + ' is ' + jsonBody.name);
			return Promise.resolve(agent);
		}
//	agent.add('Pokemon with pokedex number 1 is bulbasaur');
}

function WebhookProcessing(req, res) {
	const agent = new WebhookClient({request: req, response: res});
	console.info('agent set');

	let intentMap = new Map();
	intentMap.set('pokedex number', pokedexNumber);
	agent.handleRequest(intentMap);
}

// Webhook
app.post('/', function (req, res) {
	console.info('\n\n>>>>>> S E R V E R    H I T <<<<<<<');
	WebhookProcessing(req, res);
});

app.listen(PORT, function() {
	console.info('Webhook listening on port ' + PORT);
});

// Instantiate the Dialogflow client.
//const app = dialogflow({debug: true});

// Handle the Dialogflow intent named 'pokedex number'.
// The intent collects a parameter named 'number'.
//app.intent('pokedex number', (conv, {number}) => {
//    var rp = require('request-promise-native');

//    var options = {
//      uri: 'https://pokeapi.co/api/v2/pokemon/'+number,
//      json: true
//    }
//    return rp(options)
//      .then( response => {
//        console.log( 'response:', JSON.stringify(response, null, 1) );
//	var value = response.name;
//	return conv.close('Pokemon with pokedex number ' + number + ' is ' + value);
//    });
//
//});

