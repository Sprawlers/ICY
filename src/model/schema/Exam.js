const mongoose = require('mongoose')
const Schema = mongoose.Schema

const examSchema = new Schema(
	{
		name: String,
		date: Date,
		duration: Number,
		expireAt: Date,
	},
	{ versionKey: false }
)

examSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 })

const examModel = mongoose.model('exams', examSchema, 'exams')
module.exports = examModel
