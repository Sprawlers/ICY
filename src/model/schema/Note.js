const mongoose = require('mongoose')
const Schema = mongoose.Schema

const noteSchema = new Schema(
  {
    name: String,
    link: String,
    author: Object,
  },
  { versionKey: false }
)

const noteModel = mongoose.model('notes', noteSchema, 'notes')

module.exports = noteModel
