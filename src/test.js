// WARNING: USE THIS JS FILE FOR TESTING ONLY
const {downloadPDFFromURL} = require('./controller/functions')

downloadPDFFromURL('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'Testing.pdf')
    .catch(e => console.error(e))


