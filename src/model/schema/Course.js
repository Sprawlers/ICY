const mongoose = require('mongoose')
const Schema = mongoose.Schema

/**
 * Course Model
 *
 * title: name of the course
 * code: course code
 * examDates: object containing the dates of different exams
 * notes: object containing the notes of the subject
 *
 */
const courseSchema = new Schema(
    {
        title: String,
        code: String,
        examDates: Object,
        notes: Array
    },
    {versionKey: false}
)

const courseModel = mongoose.model('courses', courseSchema, 'courses')

module.exports = courseModel
