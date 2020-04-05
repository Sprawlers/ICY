const Homework = require('./schema/Homework')

// Gets all homework documents
const getAllHomework = Homework.find({})

module.exports = {
  homework: getAllHomework,
}
