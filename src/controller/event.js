const { handleMessage } = require('./events/message')
const { handlePostback } = require('./events/postback')
const { addLog, addFeedback, delUser } = require('../model/functions')

const handleEvent = async (event, adminID, userObject, client) => {
  switch (event.type) {
    case 'message':
      const messagelog = handleMessage(event, client, userObject)
      await addLog(userID, userObject.profileName, event.type, messagelog)
      break
    case 'postback':
      const postbacklog = handlePostback(event, client, userObject)
      await addLog(userID, userObject.profileName, postbacklog.type, postbacklog.data)
      break
    case 'unfollow':
      await addFeedback(userID, userObject.profileName, event.type, null)
      await delUser(userID)
      break
  }
}
module.exports = {
  handleEvent,
}
