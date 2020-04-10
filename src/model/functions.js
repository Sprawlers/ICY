const Homework = require('./schema/Homework')
const User = require('./schema/User')
const Feedback = require('./schema/Feedback')
const Course = require('./schema/Course')

// Gets all homework documents, called with hw()
function getAllHomework() {
  return Homework.find({})
}

// Gets a user by UUID
function getUserByID(userID) {
  return User.findOne({ userID })
}

// Gets all users
function getAllUsers() {
  return User.find({})
}

// Gets all admin users
function getAdminID() {
  return User.distinct('userID', { isAdmin: true })
}

// Gets all subjects
async function getAllCourses() {
  return await Course.find({})
}

// Adds a new user
function addUser(userID, profileName) {
  return User.create({ userID, profileName, isAdmin: false })
}

// Deletes a user
function delUser(userID) {
  return User.deleteOne({ userID })
}

// Adds a new feedback
function addFeedback(userID, profileName, type, text) {
  return Feedback.create({ userID, profileName, type, text })
}

module.exports = {
  getAllHomework,
  getUserByID,
  getAllUsers,
  getAllCourses,
  getAdminID,
  addUser,
  addFeedback,
  delUser,
}
