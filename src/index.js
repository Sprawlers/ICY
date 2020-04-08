const express = require('express')
const config = require('./config')
const line = require('@line/bot-sdk')
const bodyParser = require('body-parser')
const dialogflow = require('dialogflow')
const morgan = require('morgan')
const mongoose = require('mongoose')
const crypto = require('crypto')
const request = require('request-promise')
const projectId = config.projectId
const app = express()

// Import the appropriate class
const { generateHomework } = require('./controller/functions.js')

// Import database functions
const { getAllHomework, getUserByID, addUser, delUser, addFeedback } = require('./model/functions')
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
const sessionClient = new dialogflow.SessionsClient({
  keyFilename: `../${config.filename}`,
})

app.post('/webhook', async (req, res) => {
  const lineConfig = config.line
  // Set a new client
  const text = JSON.stringify(req.body)
  const client = new line.Client(lineConfig)
  // Generate signature for comparing with line headers
  const signature = crypto.createHmac('SHA256', lineConfig.channelSecret).update(text).digest('base64').toString()
  if (signature != req.headers['x-line-signature']) {
    return res.status(401).send('Unauthorized')
  }
  // Set reply message
  const replyMsg = {
    type: 'text',
    text: null,
  }

  // Set event
  const event = req.body.events[0]
  console.log(event)

  // Obtain user information and message information
  const userID = event.source.userId
  if (event.type != 'unfollow') {
    const profile = await client.getProfile(event.source.userId)

    // Checks if the user exists. If not, adds a new user to the collection
    const userObject = (await getUserByID(userID)) || (await addUser(userID, profile.displayName))
    console.log(userObject)

    // Log information
    console.log(`User: ${profile.displayName}`)
  }
  // Switch for event type
  switch (event.type) {
    case 'message':
      const userMsg = event.message.text
      const replyToken = event.replyToken
      console.log(userMsg)
      console.log(replyToken)

      // Dialogflow stuff
      const intentResponse = await detectIntent(userID, userMsg, 'en-US')
      console.log(intentResponse)
      const query = intentResponse.queryResult
      const intent = query.intent.displayName

      // Switch based on intent
      switch (intent) {
        case 'Homework':
          console.log(`Intent ${intent}`)
          const homeworkObjectArr = await getAllHomework()
          const payloadJSON = generateHomework(homeworkObjectArr)
          console.log(payloadJSON)
          await client.replyMessage(replyToken, payloadJSON)
          break
        default:
          console.log(`Intent ${intent}`)
          const log = await postToDialogflow(req)
          console.log(log)
          break
      }
      break
    case 'follow':
      break
    case 'unfollow':
      const userObject = await getUserByID(userID)
      const feedback = await addFeedback(userID, userObject.profileName, event.type, null)
      await delUser(userID)
      console.log(feedback)
      break
  }
  res.status(200).end()
})

const detectIntent = async (userID, message, languageCode) => {
  console.log(projectId, userID)
  const sessionPath = sessionClient.sessionPath(projectId, userID)
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: languageCode,
      },
    },
  }
  const responses = await sessionClient.detectIntent(request)
  return responses[0]
}

const postToDialogflow = (req) => {
  const body = JSON.stringify({
    destination: req.body.destination,
    events: req.body.events,
  })
  req.headers.host = 'dialogflow.cloud.google.com'
  return request.post({
    uri: `https://dialogflow.cloud.google.com/v1/integrations/line/webhook/${config.webhookid}`,
    headers: req.headers,
    body,
  })
}

app.listen(config.port, () => {
  console.log(`Server is running at port ${config.port}`)
})
