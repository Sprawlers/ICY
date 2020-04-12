const moment = require('moment')
const { getAllCourses, getAllHomework, getAdminID, addFeedback, addHomework } = require('../model/functions')
const { generateHomework, generateSubjectList } = require('./functions')

const replyMsg = { type: 'text' }

const handleIntent = async (intentResponse, userObject, client, replyToken) => {
  //Initialize query from intentResponse
  const query = intentResponse.queryResult
  const intent = query.intent.displayName
  console.log(`Intent: ${intent}`)
  const userID = userObject.userID
  switch (intent) {
    case 'Homework':
      //Generate reply JSON from homework collection
      const homeworkJSON = generateHomework(await getAllHomework())
      replyMsg.text = 'Homework Carousel'
      await client.replyMessage(replyToken, homeworkJSON)
      break
    case 'save_feedback - yes':
      // Get array of AdminID
      const adminID = await getAdminID()
      replyMsg.text = query.fulfillmentText
      const feedback = query.outputContexts[0].parameters.fields.details.stringValue
      //add feedback to feedback collection
      await addFeedback(userID, userObject.profileName, 'message', feedback)
      //feedbackMsg to send to admin
      const feedbackMsg = {
        type: 'text',
        text: 'Feedback from user: ' + feedback,
      }
      //Multicast to all admin
      await client.multicast(adminID, feedbackMsg)
      await client.replyMessage(replyToken, replyMsg)
      break
    case 'Announce':
      //If user is not an admin, clear dialogflow context
      if (!userObject.isAdmin) {
        replyMsg.text = "Sorry, I didn't get that!"
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
      //Broadcast to all users
      await client.broadcast(broadcastMsg)
      await client.replyMessage(replyToken, replyMsg)
      break
    case 'Upload':
      //If user is not an admin, clear dialogflow context
      if (!userObject.isAdmin) {
        replyMsg.text = "Sorry, I didn't get that!"
        await clearContext(userID)
        await client.replyMessage(replyToken, replyMsg)
        break
      }
      replyMsg.text = query.fulfillmentText
      //Get all courses from courses collection
      const courses = await getAllCourses()
      //Generate reply JSON from courses
      const subjectList = generateSubjectList(courses)
      await client.replyMessage(replyToken, [replyMsg, subjectList])
      break
    case 'Subject':
      replyMsg.text = query.fulfillmentText
      //Generate quickreply JSON
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
      //Convert deadline to UTC
      const deadline = new Date(moment(new Date(params.deadline.stringValue)).subtract(7, 'hours'))
      const filename = params.filename.stringValue
      const url = params.url.stringValue
      replyMsg.text = query.fulfillmentText
      //Add homework to homework collection
      await addHomework(subject, deadline, filename, url)
      await client.replyMessage(replyToken, replyMsg)
      break
    default:
      //If no additional action required, just reply to user
      replyMsg.text = query.fulfillmentText
      await client.replyMessage(replyToken, replyMsg)
      break
  }
  return replyMsg.text
}
module.exports = {
  handleIntent,
}
