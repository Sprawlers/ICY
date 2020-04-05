const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const port = process.env.PORT || 4000

// Import the appropriate class
const { WebhookClient, Payload } = require('dialogflow-fulfillment')
const { generateHomework } = require('./functions.js')

app.use(morgan('dev'))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send({
    success: true,
  })
})

app.post('/webhook', (req, res) => {
  console.log('POST: /')
  console.log('Body: ', req.body)

  //Create an instance
  const agent = new WebhookClient({
    request: req,
    response: res,
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
    const payloadJSON = JSON.stringify(generateHomework({
      Calculus: {
        deadline: new Date(),
        link: 'google.com',
      },
      Phys: {
        deadline: new Date(),
        link: 'google.com',
      },
    }))
    payload = new Payload(`LINE`, payloadJSON, { sendAsMessage: true })
    agent.add(payload)
  }

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map()
  intentMap.set('Homework', homework) // "Homework" is once Intent Name of Dialogflow Agent
  agent.handleRequest(intentMap)
})

app.listen(port, () => {
  console.log(`Server is running at port: ${port}`)
})
