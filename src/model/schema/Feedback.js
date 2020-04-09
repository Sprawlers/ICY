const mongoose = require('mongoose')
const moment = require('moment-timezone')
const Schema = mongoose.Schema

/**
 * Feedback Model
 *
 * userID: UUID of the user
 * profileName: profile name of the user as it appears in Line
 * type: Feedback type - either 'message' (normal feedback) or 'block' (indicates the action of blocking the bot)
 * text: (Only for 'message' feedback) Feedback text
 *
 */
const dateThailand = moment.tz(Date.now(), 'Asia/Bangkok')
const feedbackSchema = new Schema({
  userID: String,
  profileName: String,
  type: String,
  text: String,
  date: { type: Date, default: dateThailand },
})

// Prepares schema as a model
const feedbackModel = mongoose.model('feedback', feedbackSchema, 'feedback')

module.exports = feedbackModel
