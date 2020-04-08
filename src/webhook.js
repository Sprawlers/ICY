const express = require('express')
const config = require('./config')
const line = require('@line/bot-sdk')
const middleware = require('@line/bot-sdk').middleware
const JSONParseError = require('@line/bot-sdk').JSONParseError
const SignatureValidationFailed = require('@line/bot-sdk').SignatureValidationFailed
const dialogflow = require('dialogflow')
const projectId = config.projectId
const app = express()

app.use(middleware(config.line))
app.get('/', (req, res) => res.sendStatus(200))
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

app.use((err, req, res, next) => {
  if (err instanceof SignatureValidationFailed) {
    res.status(401).send(err.signature)
    return
  } else if (err instanceof JSONParseError) {
    res.status(400).send(err.raw)
    return
  }
  next(err) // will throw default 500
})

app.listen(config.port, () => {
  console.log(`Server is running at port ${config.port}`)
})
