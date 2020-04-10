// WARNING: USE THIS JS FILE FOR TESTING ONLY
const {downloadPDFFromURL, removeFile} = require('./controller/functions')

removeFile('./Dummy.pdf').catch(e => console.error(e))
