const TemplateA = require('./TemplateA.json')
const TemplateB = require('./TemplateB.json')
const feedback = require('./feedback.json')
const feedback_canceled = require('./feedback_canceled.json')
const feedback_confirm = require('./feedback_confirm.json')
const feedback_submitted = require('./feedback_submitted.json')
const regular_message = require('./regular_message.json')

// Refer to image of each template in images folder
const dict = {
    TemplateA,
    TemplateB,
    feedback,
    feedback_canceled,
    feedback_confirm,
    feedback_submitted,
    regular_message
}

module.exports = {
    JSONfile: templateName => dict[templateName]
}