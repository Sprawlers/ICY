const Homework = require('./schema/Homework')
const User = require('./schema/User')

// Gets all homework documents, called with hw()
function getAllHomework() {
  return Homework.find({})
}

// Gets a user by UUID
function getUserByID(userID) {
  return User.find({ userID })
}

module.exports = {
  hw: getAllHomework,
  getUserByID
}
