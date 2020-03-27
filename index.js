const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
require('dotenv').config()
const port = process.env.PORT || 4000

// Import the appropriate class
const { WebhookClient } = require('dialogflow-fulfillment')

app.use(morgan('dev'))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send({
    success: true
  })
})

app.get('/test', (req, res) => {
  res.send('Hello Test')
  console.log('Hi There')
})

app.post('/webhook', (req, res) => {
  console.log('POST: /')
  console.log('Body: ', req.body)

  //Create an instance
  const agent = new WebhookClient({
    request: req,
    response: res
  })

  //Test get value of WebhookClient
  console.log('agentVersion: ' + agent.agentVersion)
  console.log('intent: ' + agent.intent)
  console.log('locale: ' + agent.locale)
  console.log('query: ', agent.query)
  console.log('session: ', agent.session)

  //Function Location
  function homework(agent) {
    agent.add('Please select a subject...')
    agent.add('##########')
  }

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map()
  intentMap.set('Homework', homework) // "Homework" is once Intent Name of Dialogflow Agent
  agent.handleRequest(intentMap)
})

app.listen(port, () => {
  console.log(`Server is running at port: ${port}`)
})
