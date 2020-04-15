const mongoose = require('mongoose')
const Schema = mongoose.Schema

const electionSchema = new Schema(
    {
        userID: String,
        profileName: String,
        vote: String,
        rating: Number
    },
    {
        timestamps: true,
        versionKey: false,
    }
)

const electionModel = mongoose.model('election', electionSchema, 'election')

module.exports = electionModel
