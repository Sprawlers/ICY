const Homework = require('./schema/Homework')

// Gets all homework documents
const getAllHomework = await Homework.find({})

module.exports = {
  homework: getAllHomework,
}
