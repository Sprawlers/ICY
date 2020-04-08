const express = require('express')
const config = require('./config')
const line = require('@line/bot-sdk')
const bodyParser = require('body-parser')
const dialogflow = require('dialogflow')
const morgan = require('morgan')
const mongoose = require('mongoose')
const projectId = config.projectId
const app = express()

// Import the appropriate class
const {generateHomework} = require('./controller/functions.js')

// Import database functions
const {hw, getUserByID, addUser} = require('./model/functions')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(morgan('dev'))

const mongoDB = config.db_host
const db = mongoose
    .connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
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

    // Set a new client
    const client = new line.Client(config.line)

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
    const userMsg = event.message.text
    const replyToken = event.replyToken
    const profile = await client.getProfile(event.source.userId)

    // Log information
    console.log(`User: ${profile.displayName}`)
    console.log(userMsg)
    console.log(replyToken)

    // Dialogflow stuff
    const intentResponse = await detectIntent(userID, userMsg, 'en-US')
    console.log(intentResponse)

    // Checks if the user exists. If not, adds a new user to the collection
    const userObject = (await getUserByID(userID)) || (await addUser(userID, profile.displayName))
    console.log(userObject)

    const query = intentResponse.queryResult
    const intent = query.intent.displayName

    // Switch based on intent
    switch (intent) {
        case 'Homework':
            console.log(`Intent ${intent}`)
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

app.listen(config.port, () => {
    console.log(`Server is running at port ${config.port}`)
})
