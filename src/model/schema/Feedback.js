const mongoose = require('mongoose')
const Schema = mongoose.Schema

/**
 * Feedback Model
 *
 * type: Feedback type - either 'message' (normal feedback) or 'block' (indicates the action of blocking the bot)
 * text: (Only for 'message' feedback) Feedback text
 *
 */
const feedbackSchema = new Schema({
    type: String,
    text: String
})

// Prepares schema as a model
const feedbackModel = mongoose.model('feedback', feedbackSchema, 'feedback')

module.exports = feedbackModel
