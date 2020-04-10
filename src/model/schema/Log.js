const mongoose = require('mongoose')
const Schema = mongoose.Schema

/**
 * Homework Model
 *
 * title: name of the subject
 * deadline: due date of the latest assignment
 * links: object containing urls to different homework assignments
 *
 */
const logSchema = new Schema({
  userID: String,
  profileName: String,
  type: String,
  data: Object,
})

const logModel = mongoose.model('log', logSchema, 'log')

module.exports = logModel
