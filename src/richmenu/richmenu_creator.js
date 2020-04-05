const newman = require('newman') // require newman in your project
var data = require('./richmenu_creator.json')
// call newman.run to pass `options` object and wait for callback
var str = JSON.stringify(data)
var path = process.cwd()
path += '/src/richmenu/default/richmenu.jpg'
str = str.replace('%PATH%', path)
const obj = JSON.parse(str)
newman.run(
  {
    collection: obj,
    environment: require('./.env.json'),
    reporters: 'cli',
  },
  function (err) {
    if (err) {
      throw err
    }
    console.log('collection run complete!')
  }
)
