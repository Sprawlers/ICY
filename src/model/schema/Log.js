const mongoose = require('mongoose')
const Schema = mongoose.Schema

/**
 * User Model
 *
 * userID: UUID of the user
 * profileName: profile name of the user as it appears in Line
 * type: type of log
 * data: data of log
 *
 */
const logSchema = new Schema(
	{
		userID: String,
		profileName: String,
		type: String,
		data: Object,
	},
	{ timestamps: true, versionKey: false }
)

//set expire time for logSchema
logSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 * 2 })

const logModel = mongoose.model('log', logSchema, 'log')

module.exports = logModel
