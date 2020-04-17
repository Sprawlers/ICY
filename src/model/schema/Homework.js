const mongoose = require('mongoose')
const Schema = mongoose.Schema

/**
 * Homework Model
 *
 * title: name of the subject
 * assignments: object containing assignment objects (one course/subject may contain more than one assignment)
 * - assignment object format:
 *   -> deadline: DateTime object containing the assignment deadline
 *   -> link: link to the assignment
 *   -> note: (additional) anything that should be mentioned
 *
 */
const homeworkSchema = new Schema(
  {
    name: String,
    deadline: Date,
    link: String,
  },
  { versionKey: false }
)

// Prepares schema as a model
const homeworkModel = mongoose.model('homework', homeworkSchema, 'homework')

// Exports
module.exports = homeworkModel
