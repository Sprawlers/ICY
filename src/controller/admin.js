const { detectIntent, clearContext } = require('./dialogflow')
const { generateSubjectList, generateStats } = require('./functions')
const { getAllCourses, getAllHomework, getAllNotes } = require('../model/functions')

const handleAdmin = async (event, client, userObject) => {
  const userID = userObject.userID
  const replyToken = event.replyToken
  const userMsg = event.message.text
  const replyMsg = { type: 'text' }
  const adminCmd = { type: 'text', text: 'Commands\n- /broadcast\n- /add hw\n- /add notes\n- /add exam\n- /add course\n- /stat\n- /clear\n- /help' }
  const cmd = userMsg.substring(1)
  const intentResponse = await detectIntent(userID, cmd, 'en-US')
  const query = intentResponse.queryResult
  const subjectList = generateSubjectList(await getAllCourses())
  switch (cmd) {
    case 'broadcast':
      replyMsg.text = query.fulfillmentText
      await client.replyMessage(replyToken, replyMsg)
      break
    case 'add hw':
      replyMsg.text = query.fulfillmentText
      await client.replyMessage(replyToken, [replyMsg, subjectList])
      break
    case 'add notes':
      replyMsg.text = query.fulfillmentText
      await client.replyMessage(replyToken, [replyMsg, subjectList])
      break
    case 'add exam':
      replyMsg.text = query.fulfillmentText
      await client.replyMessage(replyToken, [replyMsg, subjectList])
      break
    case 'add course':
      replyMsg.text = query.fulfillmentText
      await client.replyMessage(replyToken, replyMsg)
      break
    case 'stat':
      const stat = await generateStats(await getAllHomework(), await getAllNotes())
      replyMsg.text = 'Stats'
      await client.replyMessage(replyToken, stat)
      break
    case 'help':
      replyMsg.text = 'Admin commands'
      await client.replyMessage(replyToken, adminCmd)
      break
    default:
      await clearContext(userID)
      replyMsg.text = 'This command is not available!'
      await client.replyMessage(replyToken, [replyMsg, adminCmd])
      break
  }
  return replyMsg.text
}

module.exports = { handleAdmin }
