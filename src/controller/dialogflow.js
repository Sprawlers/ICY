const config = require('../config')
const request = require('request-promise')
const dialogflow = require('dialogflow')
const projectId = config.projectId

let dialogflowConfig = {
  credentials: {
    private_key: config.private_key,
    client_email: config.client_email,
  },
}
const sessionClient = new dialogflow.SessionsClient(dialogflowConfig)

const contextClient = new dialogflow.ContextsClient({
  keyFilename: `../${config.filename}`,
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

const clearContext = async (userID) => {
  const sessionPath = contextClient.sessionPath(projectId, userID)
  return await contextClient.deleteAllContexts({ parent: sessionPath }).catch((err) => {
    console.log(err)
  })
}

const postToDialogflow = (req) => {
  const body = JSON.stringify({
    destination: req.body.destination,
    events: req.body.events,
  })
  req.headers.host = 'dialogflow.cloud.google.com'
  return request.post({
    uri: `https://dialogflow.cloud.google.com/v1/integrations/line/webhook/${config.webhookid}`,
    headers: req.headers,
    body,
  })
}
module.exports = {
  detectIntent,
  clearContext,
  postToDialogflow,
}
