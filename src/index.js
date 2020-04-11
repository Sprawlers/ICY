const express = require('express')
const config = require('./config')
const line = require('@line/bot-sdk')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const mongoose = require('mongoose')
const moment = require('moment')
const crypto = require('crypto')
const app = express()

// Import the appropriate class
const { generateHomework, generateAssignment, generateSubjectList } = require('./controller/functions')
const { detectIntent, clearContext } = require('./controller/dialogflow')

// Import database functions
const { getAllHomework, getUserByID, getAdminID, getAllCourses, addUser, delUser, addFeedback, addHomework, addLog } = require('./model/functions')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(morgan('dev'))

const mongoDB = config.db_host
mongoose.set('useCreateIndex', true)
const db = mongoose
  .connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
  .then(console.log('Connected to database'))
  .catch((e) => console.error(e))

app.get('/', (req, res) => {
  res.send({
    success: true,
  })
})

app.get('/health', (req, res) => {
  res.status(200).send('Success')
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
  // console.log(event)

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

  // Set message log object
  const messagelog = {
    user: null,
    bot: null,
  }

  // Get array of AdminID
  const adminID = await getAdminID()

  // Switch for event type
  switch (event.type) {
    case 'message':
      const userMsg = event.message.text
      messagelog.user = userMsg
      const replyToken = event.replyToken
      if (event.message.type !== 'text') {
        replyMsg.text = 'Only text input!'
        await client.replyMessage(replyToken, replyMsg)
        break
      }
      if (userMsg === '/clear') {
        replyMsg.text = 'Clear Context!'
        await clearContext(userID)
        await client.replyMessage(replyToken, replyMsg)
        break
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
          replyMsg.text = 'Homework Carousel'
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
            await client.replyMessage(replyToken, replyMsg)
            break
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
            await clearContext(userID)
            await client.replyMessage(replyToken, replyMsg)
            break
          }
          replyMsg.text = query.fulfillmentText
          const courses = await getAllCourses()
          const subjectList = generateSubjectList(courses)
          await client.replyMessage(replyToken, [replyMsg, subjectList])
          break
        case 'Subject':
          replyMsg.text = query.fulfillmentText
          const datetime = {
            type: 'text',
            text: replyMsg.text,
            quickReply: {
              items: [
                {
                  type: 'action',
                  action: {
                    type: 'datetimepicker',
                    label: 'Select date',
                    data: 'deadline',
                    mode: 'datetime',
                  },
                },
              ],
            },
          }
          await client.replyMessage(replyToken, datetime)
          break
        case 'Url - yes':
          const params = query.outputContexts[0].parameters.fields
          const subject = params.subject.stringValue
          const deadline = new Date(moment(new Date(params.deadline.stringValue)).subtract(7, 'hours')) // Convert to UTC
          const filename = params.filename.stringValue
          const url = params.url.stringValue
          replyMsg.text = query.fulfillmentText
          await addHomework(subject, deadline, filename, url)
          await client.replyMessage(replyToken, replyMsg)
          break
        default:
          replyMsg.text = query.fulfillmentText
          await client.replyMessage(replyToken, replyMsg)
          break
      }
      messagelog.bot = replyMsg.text
      await addLog(userID, userObject.profileName, event.type, messagelog)
      break
    case 'postback':
      const postback = event.postback
      console.log(postback)
      const postbacklog = {
        type: null,
        data: {},
      }
      switch (postback.data) {
        case 'deadline':
          const date = {
            type: 'text',
            text: null,
          }
          date.text = postback.params.datetime
          const intentResponse = await detectIntent(userID, date.text, 'en-US')
          console.log(intentResponse)
          const query = intentResponse.queryResult
          const intent = query.intent.displayName
          console.log(`Intent ${intent}`)
          replyMsg.text = query.fulfillmentText
          postbacklog.type = 'message'
          postbacklog.data.bot = date.text
          await client.replyMessage(event.replyToken, [date, replyMsg])
          break
        case 'richmenu/homework':
          const homeworkObjectArr = await getAllHomework()
          const payloadJSON = generateHomework(homeworkObjectArr)
          postbacklog.type = 'richmenu'
          postbacklog.data.label = 'Homework'
          await client.replyMessage(event.replyToken, payloadJSON)
          break
        case 'richmenu/notes':
          replyMsg.text = 'Notes function is not available yet.'
          postbacklog.type = 'richmenu'
          postbacklog.data.label = 'Notes'
          await client.replyMessage(event.replyToken, replyMsg)
          break
        case 'richmenu/ask':
          replyMsg.text = 'Ask function is not available yet.'
          postbacklog.type = 'richmenu'
          postbacklog.data.label = 'Ask'
          await client.replyMessage(event.replyToken, replyMsg)
          break
        case 'homework/Physics':
          //Generate assignment JSON from function by passing subject
          const assignmentJSON = generateAssignment('Physics')
          postbacklog.type = 'button'
          postbacklog.data.label = postback.data
          await client.replyMessage(event.replyToken, assignmentJSON)
          break
      }
      const result = await addLog(userID, userObject.profileName, postbacklog.type, postbacklog.data)
      console.log(result)
      break
    case 'unfollow':
      await addFeedback(userID, userObject.profileName, event.type, null)
      await delUser(userID)
      break
  }
  res.status(200).end()
})

app.listen(config.port, () => {
  console.log(`Server is running at port ${config.port}`)
})
