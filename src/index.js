const express = require('express')
const config = require('./config')
const line = require('@line/bot-sdk')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const mongoose = require('mongoose')
const crypto = require('crypto')
const app = express()

// Import the appropriate class
const { generateHomework, generateSubjectList } = require('./controller/functions')
const { detectIntent, clearContext } = require('./controller/dialogflow')

// Import database functions
const { getAllHomework, getUserByID, getAdminID, getAllCourses, addUser, delUser, addFeedback } = require('./model/functions')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(morgan('dev'))

const mongoDB = config.db_host
const db = mongoose
  .connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
  .then(console.log('Connected to database'))
  .catch((e) => console.error(e))

// console.log((async () => generateSubjectList(await getAllCourses()))())

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
  if (signature !== req.headers['x-line-signature']) {
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
  if (event.type !== 'unfollow') {
    const profile = await client.getProfile(event.source.userId)
    // Log information
    console.log(`User: ${profile.displayName}`)
  }

  // Checks if the user exists. If not, adds a new user to the collection
  const userObject = (await getUserByID(userID)) || (await addUser(userID, profile.displayName))
  console.log(userObject)

  // Get array of AdminID
  const adminID = await getAdminID()

  // Switch for event type
  switch (event.type) {
    case 'message':
      const userMsg = event.message.text
      const replyToken = event.replyToken
      console.log(userMsg)
      console.log(replyToken)
      if (event.message.type !== 'text') {
        replyMsg.text = 'Only text input!'
        return await client.replyMessage(replyToken, replyMsg)
      }

      // Dialogflow stuff
      const intentResponse = await detectIntent(userID, userMsg, 'en-US')
      console.log(intentResponse)
      const query = intentResponse.queryResult
      const intent = query.intent.displayName
      console.log(`Intent ${intent}`)

      // Switch based on intent
      switch (intent) {
        case 'Homework':
          const homeworkObjectArr = await getAllHomework()
          const payloadJSON = generateHomework(homeworkObjectArr)
          console.log(payloadJSON)
          await client.replyMessage(replyToken, payloadJSON)
          break
        case 'save_feedback - yes':
          replyMsg.text = query.fulfillmentText
          const feedback = query.outputContexts[0].parameters.fields.details.stringValue
          await addFeedback(userID, userObject.profileName, event.type, feedback)
          const feedbackMsg = {
            type: 'text',
            text: feedback,
          }
          await client.multicast(adminID, feedbackMsg)
          await client.replyMessage(replyToken, replyMsg)
          break
        case 'Announce':
          if (!userObject.isAdmin) {
            replyMsg.text = 'Only admin can broadcast!'
            const clear = await clearContext(userID)
            console.log(clear)
            return await client.replyMessage(replyToken, replyMsg)
          }
          replyMsg.text = query.fulfillmentText
          await client.replyMessage(replyToken, replyMsg)
          break
        case 'Broadcast - yes':
          replyMsg.text = query.fulfillmentText
          const broadcast = query.outputContexts[0].parameters.fields.message.stringValue
          const broadcastMsg = {
            type: 'text',
            text: broadcast,
          }
          await client.broadcast(broadcastMsg)
          await client.replyMessage(replyToken, replyMsg)
          break
        case 'Upload':
          if (!userObject.isAdmin) {
            replyMsg.text = 'Only admin can upload!'
            const clear = await clearContext(userID)
            console.log(clear)
            return await client.replyMessage(replyToken, replyMsg)
          }
          replyMsg.text = query.fulfillmentText
          const courses = await getAllCourses()
          const subjectList = generateSubjectList(courses)
          await client.replyMessage(replyToken, [replyMsg, subjectList])
          break
        case 'Subject':
          const datetime = {
            type: 'text',
            text: 'Select Date:',
            quickReply: {
              items: [
                {
                  type: 'action',
                  action: {
                    type: 'datetimepicker',
                    label: 'Select date',
                    data: 'datetime',
                    mode: 'datetime',
                  },
                },
              ],
            },
          }
          await client.replyMessage(replyToken, datetime)
          break
        case 'Filename':
          const payload = query.parameters.fields
          replyMsg.text = query.fulfillmentText
          console.log(query.outputContexts[0].parameters.fields)
          console.log(payload)
          await client.replyMessage(replyToken, replyMsg)
          break
        case 'Url':
          console.log(query.parameters.fields)
          break
        default:
          replyMsg.text = query.fulfillmentText
          await client.replyMessage(replyToken, replyMsg)
          break
      }
      break
    case 'postback':
      const postback = event.postback
      const date = {
        type: 'text',
        text: null,
      }
      if (postback.data === 'datetime') {
        date.text = postback.params.datetime
        replyMsg.text = date
        const intentResponse = await detectIntent(userID, date.text, 'en-US')
        console.log(intentResponse)
        const query = intentResponse.queryResult
        console.log(query.parameters.fields)
        const intent = query.intent.displayName
        console.log(`Intent ${intent}`)
        replyMsg.text = query.fulfillmentText
      }
      await client.replyMessage(event.replyToken, [date, replyMsg])
      break
    case 'unfollow':
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
