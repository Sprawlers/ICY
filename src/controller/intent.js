const moment = require('moment')
const { getAllCourses, getAllHomework, getAdminID, addFeedback, addHomework } = require('../model/functions')
const { generateHomework, generateSubjectList } = require('./functions')

const replyMsg = { type: 'text' }

const handleIntent = async (intentResponse, userObject, client, replyToken) => {
  console.log(`Intent ${intent}`)
  const query = intentResponse.queryResult
  const intent = query.intent.displayName
  const userID = userObject.userID
  switch (intent) {
    case 'Homework':
      const homeworkObjectArr = await getAllHomework()
      const payloadJSON = generateHomework(homeworkObjectArr)
      replyMsg.text = 'Homework Carousel'
      await client.replyMessage(replyToken, payloadJSON)
      break
    case 'save_feedback - yes':
      // Get array of AdminID
      const adminID = await getAdminID()
      replyMsg.text = query.fulfillmentText
      const feedback = query.outputContexts[0].parameters.fields.details.stringValue
      await addFeedback(userID, userObject.profileName, event.type, feedback)
      const feedbackMsg = {
        type: 'text',
        text: 'Feedback from user: ' + feedback,
      }
      await client.multicast(adminID, feedbackMsg)
      await client.replyMessage(replyToken, replyMsg)
      break
    case 'Announce':
      if (!userObject.isAdmin) {
        replyMsg.text = 'Only admin can broadcast!'
        await clearContext(userID)
        await client.replyMessage(replyToken, replyMsg)
        break
      }
      replyMsg.text = query.fulfillmentText
      await client.replyMessage(replyToken, replyMsg)
      break
    case 'Broadcast - yes':
      replyMsg.text = query.fulfillmentText
      const broadcast = query.outputContexts[0].parameters.fields.message.stringValue
      const broadcastMsg = {
        type: 'text',
        text: broadcast,
      }
      await client.broadcast(broadcastMsg)
      await client.replyMessage(replyToken, replyMsg)
      break
    case 'Upload':
      if (!userObject.isAdmin) {
        replyMsg.text = 'Only admin can upload!'
        await clearContext(userID)
        await client.replyMessage(replyToken, replyMsg)
        break
      }
      replyMsg.text = query.fulfillmentText
      const courses = await getAllCourses()
      const subjectList = generateSubjectList(courses)
      await client.replyMessage(replyToken, [replyMsg, subjectList])
      break
    case 'Subject':
      replyMsg.text = query.fulfillmentText
      const datetime = {
        type: 'text',
        text: replyMsg.text,
        quickReply: {
          items: [
            {
              type: 'action',
              action: {
                type: 'datetimepicker',
                label: 'Select date',
                data: 'deadline',
                mode: 'datetime',
              },
            },
          ],
        },
      }
      await client.replyMessage(replyToken, datetime)
      break
    case 'Url - yes':
      const params = query.outputContexts[0].parameters.fields
      const subject = params.subject.stringValue
      const deadline = new Date(moment(new Date(params.deadline.stringValue)).subtract(7, 'hours')) // Convert to UTC
      const filename = params.filename.stringValue
      const url = params.url.stringValue
      replyMsg.text = query.fulfillmentText
      await addHomework(subject, deadline, filename, url)
      await client.replyMessage(replyToken, replyMsg)
      break
    default:
      replyMsg.text = query.fulfillmentText
      await client.replyMessage(replyToken, replyMsg)
      break
  }
  return replyMsg.text
}
module.exports = {
  handleIntent,
}
