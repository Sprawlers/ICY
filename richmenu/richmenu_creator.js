const newman = require('newman') // require newman in your project
const api = require('./richmenu_creator.json')
const richmenu = require('./election/election.json')
// call newman.run to pass `options` object and wait for callback
let data = JSON.stringify(api)
let rich = JSON.stringify(richmenu)
let path = process.cwd()
path += '/election/election.png'
data = data.replace('%PATH%', path)
rich = rich.replace(/"/g, '\\"')
data = data.replace('%RICHMENU%', rich)
const collection = JSON.parse(data)
newman.run(
  {
    collection: collection,
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
