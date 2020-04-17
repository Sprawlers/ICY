const mongoose = require('mongoose')
const Schema = mongoose.Schema

const examSchema = new Schema(
  {
    name: String,
    date: Date,
    expireAt: Date,
  },
  { versionKey: false }
)

examSchema.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 })

const examModel = mongoose.model('exams', examSchema, 'exams')
module.exports = examModel
