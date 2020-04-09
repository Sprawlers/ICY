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
  postToDialogflow,
}
