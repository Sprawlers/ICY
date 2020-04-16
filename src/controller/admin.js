const { detectIntent } = require('./dialogflow')
const { generateSubjectList } = require('./functions')
const { getAllCourses } = require('../model/functions')

const handleAdmin = async (event, client, userObject) => {
  const userID = userObject.userID
  const replyToken = event.replyToken
  const userMsg = event.message.text
  const replyMsg = { type: 'text' }
  switch (userMsg) {
    case '/broadcast':
      {
        const intentResponse = await detectIntent(userID, 'broadcast', 'en-US')
        const query = intentResponse.queryResult
        replyMsg.text = query.fulfillmentText
        await client.replyMessage(replyToken, replyMsg)
      }
      break
    case '/upload hw':
      {
        const intentResponse = await detectIntent(userID, 'upload homework', 'en-US')
        const query = intentResponse.queryResult
        replyMsg.text = query.fulfillmentText
        const subjectList = generateSubjectList(await getAllCourses())
        await client.replyMessage(replyToken, [replyMsg, subjectList])
      }
      break
    case '/upload notes':
      {
        const intentResponse = await detectIntent(userID, 'upload notes', 'en-US')
        const query = intentResponse.queryResult
        replyMsg.text = query.fulfillmentText
        const subjectList = generateSubjectList(await getAllCourses())
        await client.replyMessage(replyToken, [replyMsg, subjectList])
      }
      break
    default:
      replyMsg.text = 'This command is not available!'
      await client.replyMessage(replyToken, replyMsg)
      break
  }
  return replyMsg.text
}

module.exports = { handleAdmin }
