const Homework = require('./schema/Homework')

// Gets all homework documents
const getAllHomework = Homework.find({})
async function getAllHomework() {
  return await Homework.find({})
}

module.exports = {
  hw: getAllHomework(),
}
