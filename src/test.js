const {downloadPDFFromURL} = require('./controller/functions')

downloadPDFFromURL('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'Dummy')
    .then(output => console.log(output)).catch(e => console.error(e))