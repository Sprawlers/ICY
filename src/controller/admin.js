const { detectIntent, clearContext } = require('./dialogflow')
const { generateSubjectList, generateStats, generateRegularMessageJSON } = require('./functions')
const { getAllCourses, getAllHomework, getAllNotes } = require('../model/functions')

const handleAdmin = async (event, client, userObject) => {
	const userID = userObject.userID
	const replyToken = event.replyToken
	const userMsg = event.message.text
	const replyMsg = { type: 'text' }
	const adminCmd = 'Commands\n- /broadcast\n- /add hw\n- /add notes\n- /add exam\n- /add course\n- /stat\n- /clear\n- /help'
	const cmd = userMsg.substring(1)
	const intentResponse = await detectIntent(userID, cmd, 'en-US')
	const query = intentResponse.queryResult
	const subjectList = generateSubjectList(await getAllCourses())
	switch (cmd) {
		case 'broadcast':
			replyMsg.text = query.fulfillmentText
			await client.replyMessage(replyToken, generateRegularMessageJSON(replyMsg.text))
			break
		case 'add hw':
			replyMsg.text = query.fulfillmentText
			await client.replyMessage(replyToken, [generateRegularMessageJSON(replyMsg.text), subjectList])
			break
		case 'add notes':
			replyMsg.text = query.fulfillmentText
			await client.replyMessage(replyToken, [generateRegularMessageJSON(replyMsg.text), subjectList])
			break
		case 'add exam':
			replyMsg.text = query.fulfillmentText
			await client.replyMessage(replyToken, [generateRegularMessageJSON(replyMsg.text), subjectList])
			break
		case 'add course':
			replyMsg.text = query.fulfillmentText
			await client.replyMessage(replyToken, generateRegularMessageJSON(replyMsg.text))
			break
		case 'stat':
			const stat = await generateStats(await getAllHomework(), await getAllNotes())
			replyMsg.text = 'Stats'
			await client.replyMessage(replyToken, stat)
			break
		case 'help':
			replyMsg.text = 'Admin commands'
			await client.replyMessage(replyToken, generateRegularMessageJSON(adminCmd))
			break
		default:
			await clearContext(userID)
			replyMsg.text = 'This command is not available!'
			await client.replyMessage(replyToken, [generateRegularMessageJSON(replyMsg.text), generateRegularMessageJSON(adminCmd)])
			break
	}
	return replyMsg.text
}

module.exports = { handleAdmin }
