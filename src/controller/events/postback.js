const { detectIntent } = require('../dialogflow')
const { generateHomework, generateAssignments } = require('../functions')
const { getAllHomework } = require('../../model/functions')

const replyMsg = { type: 'text' }
const postbacklog = {}

const handlePostback = async (event, client, userObject) => {
  const postback = event.postback
  const userID = userObject.userID
  const data = postback.data.split('/')
  switch (data[0]) {
    case 'deadline':
      const date = { type: 'text' }
      date.text = postback.params.datetime
      const intentResponse = await detectIntent(userID, date.text, 'en-US')
      const query = intentResponse.queryResult
      replyMsg.text = query.fulfillmentText
      postbacklog.type = 'message'
      postbacklog.data.bot = date.text
      await client.replyMessage(event.replyToken, [date, replyMsg])
      break
    case 'richmenu':
      switch (data[1]) {
        case 'homework':
          const payloadJSON = generateHomework(await getAllHomework())
          await client.replyMessage(event.replyToken, payloadJSON)
          break
        default:
          replyMsg.text = data[1].toUpperCase() + ' function is not available yet.'
          await client.replyMessage(event.replyToken, replyMsg)
      }
      postbacklog.type = 'richmenu'
      postbacklog.data.label = data[1]
      break
    case 'solution':
      //Generate assignment JSON from function by passing homework array and subject title
      const assignmentJSON = generateAssignments(await getAllHomework(), data[1])
      postbacklog.type = 'button'
      postbacklog.data.label = data[1] + ' Solution'
      await client.replyMessage(event.replyToken, assignmentJSON)
      break
  }
  return postbacklog
}
module.exports = {
  handlePostback,
}
