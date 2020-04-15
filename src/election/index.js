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

const { processDataForGraph, normalizeLatestTime } = require('./functions')

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

//Settings
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')

app.get('/election', async (req, res) => {
  let team1 = processDataForGraph(await getTeamVotes('team1'))
  let team2 = processDataForGraph(await getTeamVotes('team2'))
  normalizeLatestTime(team1, team2)
  res.render(__dirname + '/graph.ejs', { team1, team2 })
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
  const replyMsg = { type: 'text' }

  switch (event.type) {
    case 'message':
      const userMsg = event.message.text
      if (event.source.type !== 'group') await client.replyMessage(replyToken, followJSON)
      else {
        if (userMsg[0] === '/') {
          if (userObject.isAdmin) {
            if (userMsg === '/result') {
              const congratJSON = require('./electionJSON/congrat.json')
              const resultJSON = require('./electionJSON/result.json')
              await client.replyMessage(replyToken, [congratJSON, resultJSON])
            } else if (userMsg === '/promote') {
              const promoteJSON = require('./electionJSON/promote.json')
              await client.replyMessage(replyToken, promoteJSON)
            } else if (userMsg === '/leave') await client.leaveGroup(event.source.groupId)
            else {
              replyMsg.text = 'You are so smart!'
              await client.replyMessage(replyToken, replyMsg)
            }
          } else {
            replyMsg.text = userObject.profileName + ' ไม่ใช่แอดมินอย่าเสือก'
            await client.replyMessage(replyToken, replyMsg)
          }
        }
      }
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
          // replyMsg.text = 'Sorry, the voting system is closed'
          // return await client.replyMessage(replyToken, replyMsg)
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
