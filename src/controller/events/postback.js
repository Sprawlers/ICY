const { detectIntent } = require('../dialogflow')
const { generateHomework, generateAssignments } = require('../functions')
const { getAllHomework } = require('../../model/functions')

const handlePostback = async (event, client, userObject) => {
  //Initialize replyMsg and postbacklog
  const replyMsg = { type: 'text' }
  const postbacklog = { data: {} }
  const postback = event.postback
  const userID = userObject.userID
  //Split data from postback.data by '/' to make a decision
  const data = postback.data.split('/')
  console.log(data)
  switch (data[0]) {
    case 'deadline':
      const date = { type: 'text' }
      date.text = postback.params.datetime
      //detectIntent by dialogflow API and get response in intentResponse
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
          //Generate reply JSON from homework collection
          const payloadJSON = generateHomework(await getAllHomework())
          await client.replyMessage(event.replyToken, payloadJSON)
          break
        case 'notes':
          const intentResponse = await detectIntent(userID, data[1], 'en-US')
          const query = intentResponse.queryResult
          replyMsg.text = query.fulfillmentText
          await client.replyMessage(event.replyToken, replyMsg)
          brek
        case 'feedback':
          const intentResponse = await detectIntent(userID, data[1], 'en-US')
          const query = intentResponse.queryResult
          replyMsg.text = query.fulfillmentText
          await client.replyMessage(event.replyToken, replyMsg)
          break
        default:
          replyMsg.text = data[1].toUpperCase() + ' function is not available yet.'
          await client.replyMessage(event.replyToken, replyMsg)
      }
      postbacklog.type = 'richmenu'
      postbacklog.data.label = data[1]
      break
    case 'homework':
      switch (data[1]) {
        case 'solution':
          //Generate assignment JSON from function by passing homework array and subject title
          const assignmentJSON = await generateAssignments(await getAllHomework(), data[2])
          postbacklog.type = 'button'
          postbacklog.data.label = data[2] + ' Solution'
          await client.replyMessage(event.replyToken, assignmentJSON)
          break
        default:
          postbacklog.type = 'empty'
          postbacklog.data.area = data[1]
          postbacklog.data.label = data[2]
          break
      }
      break
  }
  return postbacklog
}
module.exports = {
  handlePostback,
}
