const express = require('express')
const config = require('./config')
const line = require('@line/bot-sdk')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const mongoose = require('mongoose')
const crypto = require('crypto')
const app = express()

//Import appropiate class
const { handleEvent } = require('./controller/event')

// Import database functions
const { getUserByID, addUser } = require('./model/functions')

//Initialize middleware
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
  res.status(200).send('OK')
})

app.get('/health', (req, res) => {
  res.status(200).send('OK')
})

app.post('/webhook', async (req, res) => {
  const lineConfig = config.line
  // Set a new client
  const client = new line.Client(lineConfig)

  // Generate signature for comparing with line headers
  const text = JSON.stringify(req.body)
  const signature = crypto.createHmac('SHA256', lineConfig.channelSecret).update(text).digest('base64').toString()
  if (signature !== req.headers['x-line-signature']) {
    return res.status(401).send('Unauthorized')
  }

  // Set event
  const event = req.body.events[0]

  // Obtain user information and message information
  const userID = event.source.userId
  let profile = {}

  if (event.type !== 'unfollow') {
    profile = await client.getProfile(event.source.userId)
    // Log information
    console.log(`User: ${profile.displayName}`)
  }

  // Checks if the user exists. If not, adds a new user to the collection
  const userObject = (await getUserByID(userID)) || (await addUser(userID, profile.displayName))
  console.log(userObject)

  handleEvent(event, userObject, client)
  res.status(200).end()
})

app.listen(config.port, () => {
  console.log(`Server is running at port ${config.port}`)
})
