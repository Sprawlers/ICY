const mongoose = require('mongoose')
const Schema = mongoose.Schema

/**
 * Rating Model
 *
 * rating: Rating given for an event
 *
 */
const ratingSchema = new Schema(
    {
        rating: [Number]
    }
)

const ratingModel = mongoose.model('rating', ratingSchema, 'rating')

module.exports = ratingModel