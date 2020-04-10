// WARNING: USE THIS JS FILE FOR TESTING ONLY
const {downloadPDFFromURL, removeFile, watermarkFile} = require('./controller/functions')

downloadPDFFromURL('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'Dummy.pdf').catch(e => console.error(e))

watermarkFile(__dirname + '/Dummy.pdf', 'ICY')

