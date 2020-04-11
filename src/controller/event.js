const { handleMessage } = require('./events/message')
const { handlePostback } = require('./events/postback')
const { addLog, addFeedback, delUser } = require('../model/functions')

const handleEvent = async (event, userObject, client) => {
  const userID = userObject.userID
  switch (event.type) {
    case 'message':
      //for handling message and return messagelog
      const messagelog = await handleMessage(event, client, userObject)
      console.log(messagelog)
      await addLog(userID, userObject.profileName, event.type, messagelog)
      break
    case 'postback':
      //for handling postback and return postbacklog
      const postbacklog = await handlePostback(event, client, userObject)
      console.log(postbacklog)
      await addLog(userID, userObject.profileName, postbacklog.type, postbacklog.data)
      break
    case 'unfollow':
      //add unfollow to feedback collection and delete user from user collection
      await addFeedback(userID, userObject.profileName, event.type, null)
      await delUser(userID)
      break
  }
}
module.exports = {
  handleEvent,
}
