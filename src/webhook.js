const express = require('express')
const config = require('./config')
const line = require('@line/bot-sdk')
const middleware = require('@line/bot-sdk').middleware
const bodyParser = require('body-parser')
const dialogflow = require('dialogflow')
const morgan = require('morgan')
const projectId = config.projectId
const app = express()

app.use(middleware(config.line))
app.use(bodyParser.json())
app.use(morgan('dev'))
app.get('/', (req, res) => {
  res.send({
    success: true,
  })
})
const sessionClient = new dialogflow.SessionsClient({
  projectId,
  keyFilename: './icy-gujbgu-d5b39af2ac68.json',
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
  const intentResponse = await detectIntent(userId, message, 'en')
  console.log(userMsg)
  console.log(replyToken)
  console.log(intentResponse)
})

const detectIntent = async (userId, message, languageCode) => {
  const sessionPath = sessionClient.sessionPath(projectId, userId)
  const request = {
    session: sessionPath,
    queryInput: {
      text: message,
      languageCode: languageCode,
    },
  }
  const responses = await sessionClient.detectIntent(request)
  return responses[0]
}

app.listen(config.port, () => {
  console.log(`Server is running at port ${config.port}`)
})
