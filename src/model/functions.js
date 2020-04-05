const Homework = require('./schema/Homework')

// Gets all homework documents
async function getAllHomework() {
  const data = await Homework.find({})
  return data
}

module.exports = {
  getAllHomework,
}
