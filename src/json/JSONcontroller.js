const TemplateA = require('./TemplateA.json')
const TemplateB = require('./TemplateB.json')
const TemplateC = require('./TemplateC.json')
const homeworkTasksJSON = require('./homeworkTasksJSON.json')

// Refer to image of each template in images folder
const dict = {
    'TemplateA': TemplateA,
    'TemplateB': TemplateB,
    'TemplateC': TemplateC,
    'homeworkTasksJSON': homeworkTasksJSON
}

module.exports = {
    JSONfile: templateName => dict[templateName]
}