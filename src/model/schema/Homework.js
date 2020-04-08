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
const homeworkSchema = new Schema({
  title: String,
  deadline: Date,
  links: Object,
})

// Prepares schema as a model
const homeworkModel = mongoose.model('homework', homeworkSchema, 'homework')

// Exports
module.exports = homeworkModel
