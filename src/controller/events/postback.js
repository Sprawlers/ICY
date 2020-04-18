const { detectIntent, clearContext } = require('../dialogflow')
const { generateHomeworkJSON, generateAssignments, generateNotesJSON } = require('../functions')
const { getAllHomework, getAllNotes } = require('../../model/functions')

const handlePostback = async (event, client, userObject) => {
	//Initialize replyMsg and postbacklog
	const replyMsg = { type: 'text' }
	const date = { type: 'text' }
	const postbacklog = { data: {} }
	const postback = event.postback
	const userID = userObject.userID
	let intentResponse = {}
	let query = {}
	//Split data from postback.data by '/' to make a decision
	const data = postback.data.split('/')
	console.log(data)
	switch (data[0]) {
		case 'deadline':
			date.text = postback.params.datetime
			//detectIntent by dialogflow API and get response in intentResponse
			intentResponse = await detectIntent(userID, date.text, 'en-US')
			query = intentResponse.queryResult
			replyMsg.text = query.fulfillmentText
			postbacklog.type = 'message'
			postbacklog.data.bot = date.text
			await client.replyMessage(event.replyToken, [date, replyMsg])
			break
		case 'examDate':
			date.text = postback.params.datetime
			intentResponse = await detectIntent(userID, date.text, 'en-US')
			query = intentResponse.queryResult
			replyMsg.text = query.fulfillmentText
			postbacklog.type = 'message'
			postbacklog.data.bot = replyMsg.text
			await client.replyMessage(event.replyToken, replyMsg)
			break
		case 'richmenu':
			await clearContext(userID)
			switch (data[1]) {
				case 'homework':
					//Generate reply JSON from homework collection
					const payloadJSON = await generateHomeworkJSON(await getAllHomework())
					await client.replyMessage(event.replyToken, payloadJSON)
					break
				case 'notes':
					const notesList = await generateNotesJSON(await getAllNotes())
					await client.replyMessage(event.replyToken, notesList)
					break
				case 'feedback':
					intentResponse = await detectIntent(userID, data[1], 'en-US')
					query = intentResponse.queryResult
					replyMsg.text = query.fulfillmentText
					await client.replyMessage(event.replyToken, replyMsg)
					break
				default:
					replyMsg.text = data[1].toUpperCase() + ' function is not available yet.'
					await client.replyMessage(event.replyToken, replyMsg)
					break
			}
			postbacklog.type = 'richmenu'
			postbacklog.data.label = data[1]
			break
		case 'homework':
			switch (data[1]) {
				case 'solution':
					//Generate assignment JSON from function by passing homework array and subject title
					const assignmentJSON = await generateAssignments(await getAllHomework(), data[2])
					postbacklog.type = 'button'
					postbacklog.data.label = data[2] + ' Solution'
					await client.replyMessage(event.replyToken, assignmentJSON)
					break
				default:
					postbacklog.type = 'empty'
					postbacklog.data.area = data[1]
					postbacklog.data.label = data[2]
					break
			}
			break
	}
	return postbacklog
}
module.exports = {
	handlePostback,
}
