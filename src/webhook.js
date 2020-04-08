const express = require('express')
const config = require('./config')
const line = require('@line/bot-sdk')
const bodyParser = require('body-parser')
const dialogflow = require('dialogflow').v2beta1
const morgan = require('morgan')
const mongoose = require('mongoose')
const projectId = config.projectId
const app = express()

// Import the appropriate class
const { generateHomework } = require('./controller/functions.js')

// Import database functions
const { hw } = require('./model/functions')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(morgan('dev'))

const mongoDB = config.db_host
const db = mongoose
  .connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
  .then(console.log('Connected to database')).cat

app.get('/', (req, res) => {
  res.send({
    success: true,
  })
})
console.log(typeof config.keyFilename)
const sessionClient = new dialogflow.SessionsClient({
  keyFilename: '../icy-gujbgu-d5b39af2ac68.json',
})

app.post('/webhook', async (req, res) => {
  res.json(req.body.events[0]) // req.body will be webhook event object
  const client = new line.Client(config.line)
  const replyMsg = {
    type: 'text',
    text: null,
  }
  const event = req.body.events[0]
  const userId = event.source.userId
  const userMsg = event.message.text
  const replyToken = event.replyToken
  const profile = await client.getProfile(event.source.userId)
  console.log(`User: ${profile.displayName}`)
  console.log(userMsg)
  console.log(replyToken)
  console.log(userId)
  const intentResponse = await detectIntent(userId, userMsg, 'en-US')
  console.log(intentResponse)
  const query = intentResponse.queryResult
  const intent = query.intent.displayName
  switch (intent) {
    case 'Homework':
      console.log(`Intent ${intent}`)
      replyMsg.text = 'Please select a subject...'
      const homeworkObjectArr = await hw()
      const payloadJSON = generateHomework(homeworkObjectArr)
      console.log(payloadJSON)
      await client.replyMessage(replyToken, payloadJSON)
      break
    default:
      console.log(`Intent ${intent}`)
      replyMsg.text = query.fulfillmentText
      await client.replyMessage(replyToken, replyMsg)
      break
  }
  res.status(200).end()
})

const detectIntent = async (userId, message, languageCode) => {
  console.log(projectId, userId)
  const sessionPath = sessionClient.sessionPath(projectId, userId)
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        // The query to send to the dialogflow agent
        text: message,
        // The language used by the client (en-US)
        languageCode: languageCode,
      },
    },
  }
  const responses = await sessionClient.detectIntent(request)
  return responses[0]
}

app.listen(config.port, () => {
  console.log(`Server is running at port ${config.port}`)
})
