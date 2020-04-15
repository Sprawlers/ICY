const Homework = require('./schema/Homework')
const User = require('./schema/User')
const Feedback = require('./schema/Feedback')
const Course = require('./schema/Course')
const Log = require('./schema/Log')
const Election = require('./schema/Election')
const Rating = require('./schema/Rating')

async function getAllHomework() {
  return await Homework.find({})
}

function getUserByID(userID) {
  return User.findOne({ userID })
}

async function getAllUsers() {
  return await User.find({})
}

function getAdminID() {
  return User.distinct('userID', { isAdmin: true })
}

async function getAllCourses() {
  return await Course.find({})
}

function getCourse(courseName) {
  return Course.findOne({ title: courseName })
}

function addUser(userID, profileName) {
  return User.create({ userID, profileName, isAdmin: false })
}

function delUser(userID) {
  return User.deleteOne({ userID })
}

function addFeedback(userID, profileName, type, text) {
  return Feedback.create({ userID, profileName, type, text })
}

function addHomework(subject, deadline, filename, link) {
  const hw = {}
  hw['assignments.' + filename] = { deadline, link }
  return Homework.findOneAndUpdate({ title: subject }, { $set: hw }, { upsert: true })
}

function addLog(userID, profileName, type, data) {
  return Log.create({ userID, profileName, type, data })
}

function addVote(userID, profileName, vote) {
  return Election.create({ userID, profileName, vote })
}

function getVote(userID) {
  return Election.findOne({ userID })
}

function addRating(userID, rating) {
  return Rating.findOneAndUpdate({ userID, rating })
}

module.exports = {
  getAllHomework,
  getUserByID,
  getAllUsers,
  getAllCourses,
  getCourse,
  getAdminID,
  getVote,
  addHomework,
  addUser,
  addFeedback,
  addLog,
  addVote,
  addRating,
  delUser,
}
