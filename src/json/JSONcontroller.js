const TemplateA = require('./TemplateA.json')
const TemplateB = require('./TemplateB.json')
const feedback = require('./intent/feedback.json')
const feedback_canceled = require('./intent/feedback_canceled.json')
const feedback_confirm = require('./intent/feedback_confirm.json')
const feedback_submitted = require('./intent/feedback_submitted.json')
const regular_message = require('./intent/regular_message.json')
const text_only = require('./text_only.json')

// Refer to image of each template in images folder
const dict = {
	TemplateA,
	TemplateB,
	feedback,
	feedback_canceled,
	feedback_confirm,
	feedback_submitted,
	regular_message,
	text_only,
}

module.exports = {
	JSONfile: (templateName) => dict[templateName],
}
