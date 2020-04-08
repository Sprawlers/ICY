const Homework = require('./schema/Homework')
const User = require('./schema/User')

// Gets all homework documents, called with hw()
function getAllHomework() {
  return Homework.find({})
}

// Gets a user by UUID
function getUserByID(userID) {
  return User.findOne({ userID })
}

// Adds a new user to the table
async function addUser(userID, profileName) {
  return await User.insertOne({ userID, profileName, isAdmin: false })
}

module.exports = {
  hw: getAllHomework,
  getUserByID,
  addUser
}
