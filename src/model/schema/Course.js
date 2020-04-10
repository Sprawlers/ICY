const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Course Model
 *
 * title: name of the course
 * time:
 * links: object containing urls to different homework assignments
 *
 */
const courseSchema = new Schema({
    title: String
})

const courseModel = mongoose.model('courses', courseSchema, 'courses')

module.exports = courseModel
