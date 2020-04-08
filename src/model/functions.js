const Homework = require('./schema/Homework')
const User = require('./schema/User')
const Feedback = require('./schema/Feedback')

// Gets all homework documents, called with hw()
function getAllHomework() {
  return Homework.find({})
}

// Gets a user by UUID
function getUserByID(userID) {
  return User.findOne({ userID })
}

// Adds a new user to the table
function addUser(userID, profileName) {
  return User.create({ userID, profileName, isAdmin: false })
}

function delUser(userID) {
  return User.deleteOne({ userID })
}

function getFeedback(userID, profileName, type, text) {
  return Feedback.create({ userID, profileName, type, text })
}

module.exports = {
  getAllHomework,
  getUserByID,
  addUser,
  getFeedback,
  delUser,
}
