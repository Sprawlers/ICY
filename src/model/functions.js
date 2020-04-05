const Homework = require('./schema/Homework')

// Gets all homework documents
function getAllHomework() {
  return Homework.find({})
}

module.exports = {
  hw: getAllHomework,
}
