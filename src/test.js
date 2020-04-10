// WARNING: USE THIS JS FILE FOR TESTING ONLY
const {downloadPDFFromURL, removeFile, watermarkFile} = require('./controller/functions')
const {generateSubjectList} = require('./controller/functions')
const {getAllHomework} = require('./model/functions')

/*downloadPDFFromURL('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'Dummy.pdf')
    .then(() => watermarkFile(__dirname + '/Dummy.pdf', 'ICY'))
    .catch(e => console.error(e))*/

console.log((async () =>
    await getAllHomework()
)())

