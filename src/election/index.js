const express = require('express')
const config = require('../config')
const line = require('@line/bot-sdk')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const mongoose = require('mongoose')
const crypto = require('crypto')
const app = express()

// Import database functions
const { getUserByID, addUser, addFeedback, delUser, getVote, addVote, addRating, getTeamVotes } = require('../model/functions')

//Initialize middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(morgan('dev'))

// Database config
const mongoDB = config.db_host
// Set to suppress warning from using index in schema
mongoose.set('useCreateIndex', true)
const db = mongoose
  .connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
  .then(console.log('Connected to database'))
  .catch((e) => console.error(e))

app.get('/', (req, res) => {
  res.status(200).send('OK')
})

// For health check from server
app.get('/health', (req, res) => {
  res.status(200).send('OK')
})

app.get('/graph', (req, res) => {
  let team1 = getTeamVotes('team1')
  res.send(team1)
  res.render('index.ejs', {})
})

app.post('/election', async (req, res) => {
  const lineConfig = config.line
  const client = new line.Client(lineConfig)
  const text = JSON.stringify(req.body)
  const signature = crypto.createHmac('SHA256', lineConfig.channelSecret).update(text).digest('base64').toString()
  if (signature !== req.headers['x-line-signature']) {
    return res.status(401).send('Unauthorized')
  }
  const event = req.body.events[0]
  const userID = event.source.userId || null
  let profile = {}
  if (event.type !== 'unfollow' && event.type !== 'join') {
    profile = await client.getProfile(event.source.userId)
  }
  const userObject = userID ? (await getUserByID(userID)) || (await addUser(userID, profile.displayName)) : null
  console.log(userObject)
  const replyToken = event.replyToken
  const isEmpty = (obj) => {
    if (!obj) return true
    return Object.keys(obj).length === 0
  }
  const followJSON = require('./electionJSON/follow.json')
  const invitationJSON = require('./electionJSON/invitation.json')

  switch (event.type) {
    case 'message':
      if (event.source.type !== 'group') await client.replyMessage(replyToken, followJSON)
      break
    case 'postback':
      const postback = event.postback
      const data = postback.data.split('/')
      console.log(data)
      switch (data[0]) {
        case 'richmenu':
          const teamData = require(`./electionJSON/${data[1]}.json`)
          await client.replyMessage(replyToken, teamData)
          break
        case 'choose':
          const confirmJSON = require(`./electionJSON/confirm_${data[1]}.json`)
          await client.replyMessage(replyToken, confirmJSON)
          break
        case 'vote':
          const voteData = await getVote(userID)
          if (isEmpty(voteData)) {
            let vote
            if (data[1] === 'team1') vote = 'team1'
            else if (data[1] === 'team2') vote = 'team2'
            await addVote(userID, userObject.profileName, vote)
            const thanksJSON = require(`./electionJSON/thanks_${data[1]}.json`)
            const ratingJSON = require('./electionJSON/rating.json')
            await client.replyMessage(replyToken, [thanksJSON, ratingJSON])
          } else {
            const votedJSON = require('./electionJSON/voted.json')
            await client.replyMessage(replyToken, [votedJSON, invitationJSON])
          }
          break
        case 'rating':
          const votedata = await getVote(userID)
          const thanksJSON = require('./electionJSON/thanks_rating.json')
          if (!votedata.rating) {
            const rating = Number.parseInt(data[1])
            await addRating(userID, rating)
            await client.replyMessage(replyToken, [thanksJSON, invitationJSON])
          } else {
            const ratedJSON = require('./electionJSON/rated.json')
            await client.replyMessage(replyToken, [ratedJSON, invitationJSON])
          }
          break
      }
      break
    case 'follow':
      await client.replyMessage(replyToken, followJSON)
      break
    case 'unfollow':
      await addFeedback(userID, userObject.profileName, event.type, null)
      await delUser(userID)
      break
    case 'join':
      const joinJSON = require('./electionJSON/join.json')
      await client.replyMessage(replyToken, joinJSON)
      break
    default:
      break
  }
  res.status(200).send('OK')
})

app.listen(config.port, () => {
  console.log(`Server is running at port ${config.port}`)
})
