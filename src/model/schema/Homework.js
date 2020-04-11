const mongoose = require('mongoose')
const Schema = mongoose.Schema

/**
 * Homework Model
 *
 * title: name of the subject
 * assignments: object containing assignments with their name, deadline, and link
 *
 */
const homeworkSchema = new Schema(
    {
        title: String,
        assignments: Object
    },
    {versionKey: false}
)

// Prepares schema as a model
const homeworkModel = mongoose.model('homework', homeworkSchema, 'homework')

// Exports
module.exports = homeworkModel
