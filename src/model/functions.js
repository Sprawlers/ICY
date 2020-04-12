const Homework = require('./schema/Homework')
const User = require('./schema/User')
const Feedback = require('./schema/Feedback')
const Course = require('./schema/Course')
const Log = require('./schema/Log')

// Gets all homework documents, called with hw()
async function getAllHomework() {
  return await Homework.find({})
}

// Gets a user by UUID
function getUserByID(userID) {
  return User.findOne({ userID })
}

// Gets all users
async function getAllUsers() {
  return await User.find({})
}

// Gets all admin users
function getAdminID() {
  return User.distinct('userID', { isAdmin: true })
}

// Gets all subjects
async function getAllCourses() {
  return await Course.find({})
}

// Gets a particular course
function getCourse(courseName) {
  return Course.findOne({ 'title': courseName })
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

// Adds a new homework assignment given parameters
function addHomework(subject, deadline, filename, link) {
  const hw = {}
  hw['assignments.' + filename] = { deadline, link }
  return Homework.findOneAndUpdate({ title: subject }, { $set: hw }, { upsert: true })
}

function addLog(userID, profileName, type, data) {
  return Log.create({ userID, profileName, type, data })
}

module.exports = {
  getAllHomework,
  getUserByID,
  getAllUsers,
  getAllCourses,
  getCourse,
  getAdminID,
  addHomework,
  addUser,
  addFeedback,
  addLog,
  delUser,
}
