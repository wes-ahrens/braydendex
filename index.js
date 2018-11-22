'use strict';

// Import the Dialogflow module from the Actions on Google client library.
const {dialogflow} = require('actions-on-google');

// Instantiate the Dialogflow client.
const app = dialogflow({debug: true});

// Handle the Dialogflow intent named 'pokedex number'.
// The intent collects a parameter named 'number'.
app.intent('pokedex number', (conv, {number}) => {
    var https = require('https');
    var path = 'api/v2/pokemon/'+number;
    var options = {
        host: 'pokeapi.co',
        path: path,
        method: 'GET',
        headers: {}
    };
    var req = https.request(options, function(res) {
        res.setEncoding('utf-8');
    
        var responseString = '';
    
        res.on('data', function(data) {
          responseString += data;
        });
    
        res.on('end', function() {
          var responseObject = JSON.parse(responseString);
          conv.close('Pokemon with pokedex number ' + number + ' is ' + responseObject.name)
        });
    });

    req.write();
    req.end();
});

// Set the DialogflowApp object to handle the HTTPS POST request.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
