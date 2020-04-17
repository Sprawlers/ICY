const TemplateA = require('./TemplateA.json')
const TemplateB = require('./TemplateB.json')
const TemplateC = require('./TemplateC.json')

const dict = {
    'TemplateA': TemplateA,
    'TemplateB': TemplateB,
    'TemplateC': TemplateC
}

module.exports = templateName => dict[templateName]