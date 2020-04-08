const mongoose = require('mongoose')
const Schema = mongoose.Schema

/**
 * User Model
 *
 * userID: UUID of the user
 * profileName: profile name of the user as it appears in Line
 * email: email address of the user
 * isAdmin: check whether the user is an admin or not
 *
 */
const userSchema = new Schema({
    userID: String,
    profileName: String,
    email: String,
    isAdmin: Boolean,
})

// Prepares schema as a model
const userModel = mongoose.model('users', userSchema, 'users')

module.exports = userModel
