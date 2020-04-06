const Homework = require('./schema/Homework')

// Gets all homework documents, called with hw()
function getAllHomework() {
  return Homework.find({})
}

module.exports = {
  hw: getAllHomework,
}
