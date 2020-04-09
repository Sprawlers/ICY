const express = require('express')
const config = require('./config')
const line = require('@line/bot-sdk')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const mongoose = require('mongoose')
const crypto = require('crypto')
const app = express()

// Import the appropriate class
const { generateHomework } = require('./controller/functions')
const { detectIntent } = require('./controller/dialogflow')

// Import database functions
const { getAllHomework, getUserByID, getAdminID, addUser, delUser, addFeedback } = require('./model/functions')
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
      if (event.message.type != 'text') {
        replyMsg.text = 'Only text input!'
        return await client.replyMessage(replyToken, replyMsg)
      }

      // Dialogflow stuff
      const intentResponse = await detectIntent(userID, userMsg, 'en-US')
      console.log(intentResponse)
      console.log(intentResponse.queryResult.fulfillmentMessages)
      console.log(intentResponse.queryResult.outputContexts)
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
        case 'save_feedback - yes':
          replyMsg.text = query.fulfillmentText
          const feedback = query.outputContexts[0].parameters.fields.details.stringValue
          const userObject = await getUserByID(userID)
          await addFeedback(userID, userObject.profileName, event.type, feedback)
          const admin = await getAdminID()
          const feedbackMsg = {
            type: 'text',
            text: feedback,
          }
          await client.multicast(admin, feedbackMsg)
          await client.replyMessage(replyToken, replyMsg)
          break
        case 'Broadcast - yes':
          replyMsg.text = query.fulfillmentText
          const broadcastMsg = query.outputContexts[0].parameters.fields.message.stringValue
          await client.broadcast(broadcastMsg)
          await client.replyMessage(replyToken, replyMsg)
          break
        default:
          replyMsg.text = query.fulfillmentText
          await client.replyMessage(replyToken, replyMsg)
          break
      }
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

app.listen(config.port, () => {
  console.log(`Server is running at port ${config.port}`)
})
