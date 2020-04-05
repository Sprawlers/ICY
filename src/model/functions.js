const Homework = require('./schema/Homework')

// Gets all homework documents
async function getAllHomework() {
  return await Homework.find({})
}

module.exports = {
  hw: getAllHomework,
}
