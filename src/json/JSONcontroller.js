const TemplateA = require('./TemplateA.json')
const TemplateB = require('./TemplateB.json')

// Refer to image of each template in images folder
const dict = {
    'TemplateA': TemplateA,
    'TemplateB': TemplateB
}

module.exports = {
    JSONfile: templateName => dict[templateName]
}