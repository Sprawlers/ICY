// WARNING: USE THIS JS FILE FOR TESTING ONLY
const {downloadPDFFromURL, removeFile} = require('./controller/functions')

removeFile('./Dummy.pdf').then(() => console.log("successfully removed file")).catch(e => console.error(e))
