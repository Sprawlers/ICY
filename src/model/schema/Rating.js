const mongoose = require('mongoose')
const Schema = mongoose.Schema

/**
 * Rating Model
 *
 * userID: UUID of the user
 * rating: Rating given for an event
 *
 */
const ratingSchema = new Schema(
    {
        userID: String,
        rating: Number
    }
)

const ratingModel = mongoose.model('rating', ratingSchema, 'rating')

module.exports = ratingModel