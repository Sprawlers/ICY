const moment = require('moment')
const { getAllHomework, getAdminID, addFeedback, addHomework, addNotes, addExam, addCourse, getAllNotes, getAllExams } = require('../model/functions')
const { generateHomeworkJSON, generateNotesJSON, generateRegularMessageJSON, generateExamMessageJSON } = require('./functions')
const { clearContext, detectIntent } = require('./dialogflow')
const { JSONfile } = require('../json/JSONcontroller')

const handleIntent = async (intentResponse, userObject, client, replyToken, userMsg = null) => {
	const replyMsg = { type: 'text' }
	//Initialize query from intentResponse
	const query = intentResponse.queryResult
	const intent = query.intent.displayName
	console.log(`Intent: ${intent}`)
	console.log(query)
	const userID = userObject.userID
	switch (intent) {
		case 'Homework':
			//Generate reply JSON from homework collection
			const homeworkJSON = await generateHomeworkJSON(await getAllHomework())
			replyMsg.text = 'Homework Carousel'
			await client.replyMessage(replyToken, homeworkJSON)
			break
		case 'Notes':
			//Get all courses from courses collection and generate notesList from courses
			replyMsg.text = 'Notes list'
			const notesList = await generateNotesJSON(await getAllNotes())
			await client.replyMessage(replyToken, notesList)
			break
		case 'Exams':
			const examJSON = generateExamMessageJSON(await getAllExams())
			replyMsg.text = 'Exam JSON'
			await client.replyMessage(replyToken, examJSON)
			break
		case 'Feedback':
			replyMsg.text = 'Feedback JSON'
			await client.replyMessage(replyToken, JSONfile('feedback'))
			break
		case 'Feedback_save':
			const adminID = await getAdminID()
			replyMsg.text = 'Feedback submitted'
			let feedback = query.parameters.fields.details.stringValue
			if (userMsg) {
				await addFeedback(userID, userObject.profileName, 'message', userMsg)
				feedback = userMsg
			} else await addFeedback(userID, userObject.profileName, 'message', feedback)
			const feedbackMsg = {
				type: 'text',
				text: `Feedback from user, ${userObject.profileName}:\n` + feedback,
			}
			//Multicast to all admin
			await client.multicast(adminID, feedbackMsg)
			await client.replyMessage(replyToken, JSONfile('feedback_submitted'))
			break
		case 'Broadcast':
			await clearContext(userID)
			replyMsg.text = "Sorry, I didn't get that!"
			await client.replyMessage(replyToken, generateRegularMessageJSON(replyMsg.text))
			break
		case 'Broadcast - yes':
			replyMsg.text = query.fulfillmentText
			const broadcast = query.parameters.fields.message.stringValue
			//Broadcast to all users
			await client.broadcast(generateRegularMessageJSON(broadcast))
			await client.replyMessage(replyToken, generateRegularMessageJSON(replyMsg.text))
			break
		case 'Homework_upload':
			await clearContext(userID)
			replyMsg.text = "Sorry, I didn't get that!"
			await client.replyMessage(replyToken, generateRegularMessageJSON(replyMsg.text))
			break
		case 'Notes_upload':
			await clearContext(userID)
			replyMsg.text = "Sorry, I didn't get that!"
			await client.replyMessage(replyToken, generateRegularMessageJSON(replyMsg.text))
			break
		case 'Exam_add':
			await clearContext(userID)
			replyMsg.text = "Sorry, I didn't get that!"
			await client.replyMessage(replyToken, generateRegularMessageJSON(replyMsg.text))
			break
		case 'Course_add':
			await clearContext(userID)
			replyMsg.text = "Sorry, I didn't get that!"
			await client.replyMessage(replyToken, generateRegularMessageJSON(replyMsg.text))
			break
		case 'Homework_subject':
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
		case 'Exam_name':
			replyMsg.text = query.fulfillmentText
			//Generate quickreply JSON
			const examDate = {
				type: 'text',
				text: replyMsg.text,
				quickReply: {
					items: [
						{
							type: 'action',
							action: {
								type: 'datetimepicker',
								label: 'Select date',
								data: 'examDate',
								mode: 'datetime',
							},
						},
					],
				},
			}
			await client.replyMessage(replyToken, examDate)
			break
		case 'Notes_type':
			{
				const params = query.parameters.fields
				const type = params.type.stringValue
				if (type === 'Notes') replyMsg.text = query.fulfillmentText
				else {
					const intentResponse = await detectIntent(userID, 'None None', 'en-US')
					const query = intentResponse.queryResult
					replyMsg.text = query.fulfillmentText
				}
				await client.replyMessage(replyToken, replyMsg)
			}
			break
		case 'Course_id - yes':
			{
				const params = query.parameters.fields
				const name = params.name.stringValue
				const id = params.id.stringValue
				replyMsg.text = query.fulfillmentText
				await addCourse(name, id)
				await client.replyMessage(replyToken, replyMsg)
			}
			break
		case 'Homework_author - yes':
			{
				const params = query.parameters.fields
				const subject = params.subject.stringValue
				const filename = params.filename.stringValue
				const deadline = new Date(moment(new Date(params.deadline.stringValue)).subtract(7, 'hours'))
				const url = params.url.stringValue
				const authorName = params.author_name.stringValue
				const authorMajor = params.author_major.stringValue
				replyMsg.text = query.fulfillmentText
				await addHomework(subject, deadline, filename, url, authorName, authorMajor)
				await client.replyMessage(replyToken, replyMsg)
			}
			break
		case 'Exam_duration - yes':
			{
				const params = query.parameters.fields
				const subject = params.subject.stringValue
				const name = params.name.stringValue
				const date = new Date(moment(new Date(params.date.stringValue)).subtract(7, 'hours'))
				const duration = params.duration.structValue.fields.amount.numberValue
				replyMsg.text = query.fulfillmentText
				await addExam(subject, name, date, duration)
				await client.replyMessage(replyToken, replyMsg)
			}
			break
		case 'Notes_author - yes':
			{
				const params = query.parameters.fields
				const subject = params.subject.stringValue
				const filename = params.filename.stringValue
				const url = params.url.stringValue
				const type = params.type.stringValue
				const authorName = params.author_name.stringValue
				const authorMajor = params.author_major.stringValue
				replyMsg.text = query.fulfillmentText
				await addNotes(subject, filename, url, type, authorName, authorMajor)
				await client.replyMessage(replyToken, replyMsg)
			}
			break
		default:
			replyMsg.text = query.fulfillmentText
			await client.replyMessage(replyToken, generateRegularMessageJSON(replyMsg.text))
			break
	}
	return replyMsg.text
}
module.exports = {
	handleIntent,
}
