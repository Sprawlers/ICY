const { detectIntent, clearContext } = require('../dialogflow')
const { handleIntent } = require('../intent')

const replyMsg = { type: 'text' }
const messagelog = {}

const handleMessage = async (event, client, userObject) => {
  const userID = userObject.userID
  const replyToken = event.replyToken
  if (event.message.type !== 'text') {
    messagelog.user = 'Non-Text Format'
    replyMsg.text = 'Only text input!'
    messagelog.bot = replyMsg.text
    await client.replyMessage(replyToken, replyMsg)
    return messagelog
  }
  const userMsg = event.message.text
  messagelog.user = userMsg
  if (userMsg === '/clear') {
    replyMsg.text = 'Clear Context!'
    messagelog.bot = replyMsg.text
    await clearContext(userID)
    await client.replyMessage(replyToken, replyMsg)
    return messagelog
  }

  // Dialogflow stuff
  const intentResponse = await detectIntent(userID, userMsg, 'en-US')

  //handleIntent function
  messagelog.bot = await handleIntent(intentResponse, userObject, client, replyToken)
  return messagelog
}

module.exports = {
  handleMessage,
}
