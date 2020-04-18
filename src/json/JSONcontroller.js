const TemplateA = require('./TemplateA.json')
const TemplateB = require('./TemplateB.json')
const TemplateC = require('./TemplateC.json')
const homeworkTasksJSON = require('./homeworkTasksJSON.json')

const dict = {
    'TemplateA': TemplateA,
    'TemplateB': TemplateB,
    'TemplateC': TemplateC,
    'homeworkTasksJSON': homeworkTasksJSON
}

module.exports = templateName => dict[templateName]