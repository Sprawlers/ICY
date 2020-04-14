const mongoose = require('mongoose')
const Schema = mongoose.Schema

const electionSchama = new Schema(
  {
    userID: String,
    profileName: String,
    vote: String,
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

const electionModel = mongoose.model('election', electionSchama, 'election')

module.exports = electionModel
