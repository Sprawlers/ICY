const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const port = process.env.PORT || 4000;

// Import environmental variables
require('dotenv').config({ path: './.env'});

// Import the appropriate class
const { WebhookClient, Payload } = require('dialogflow-fulfillment');
const { generateHomework } = require('./controller/functions.js');

app.use(morgan('dev'));
app.use(bodyParser.json());

// Connect to database
const mongoDB = process.env.DB_HOST;
const db = mongoose.connect(mongoDB, {useNewUrlParser: true});

// Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.get('/', (req, res) => {
  res.send({
    success: true,
  })
});

app.post('/webhook', (req, res) => {
  console.log('POST: /');
  console.log('Body: ', req.body);

  //Create an instance
  const agent = new WebhookClient({
    request: req,
    response: res,
  });

  //Test get value of WebhookClient
  console.log('agentVersion: ' + agent.agentVersion);
  console.log('intent: ' + agent.intent);
  console.log('locale: ' + agent.locale);
  console.log('query: ', agent.query);
  console.log('session: ', agent.session);

  //Function Location
  function homework(agent) {
    agent.add('Please select a subject...');
    const payloadJSON = generateHomework({
      Calculus: {
        deadline: new Date(),
        link: 'https://alligator.io/js/json-parse-stringify/',
      },
      Physics: {
        deadline: new Date(),
        link: 'https://alligator.io/js/json-parse-stringify/',
      },
    });
    console.log(payloadJSON);
    payload = new Payload(`LINE`, payloadJSON, { sendAsMessage: true });
    agent.add(payload)
  }

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Homework', homework); // "Homework" is once Intent Name of Dialogflow Agent
  agent.handleRequest(intentMap)
});

app.listen(port, () => {
  console.log(`Server is running at port: ${port}`)
});
