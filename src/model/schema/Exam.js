const mongoose = require('mongoose')
const Schema = mongoose.Schema

const examSchema = new Schema({
  name: String,
  date: Date,
  expireAt: Date,
})

const examModel = mongoose.model('exams', examSchema, 'exams')
module.exports = examModel
