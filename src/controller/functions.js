const moment = require('moment-timezone')
const fs = require('fs')
const request = require('request-promise')
const config = '../config.js'

/**
 * a function that constructs a carousel message for homework
 *
 * Example homework object:
 * {
 *     "Calculus": {
 *         "deadline": (DateTime Object),
 *         "link": (URL)
 *     }
 * }
 *
 * @param arr Array containing homework objects
 */
const generateHomework = (arr) => ({
  type: 'flex',
  altText: 'homework',
  contents: {
    type: 'carousel',
    contents: generateBubbles(arr),
  },
})

// Function to sort array of objects by parameter
const sortByParam = (arr, param) => {
  const arrCopy = [...arr]
  arrCopy.sort((a, b) => {
    let dateA = new Date(a[param])
    let dateB = new Date(b[param])
    return dateA - dateB
  })
  return arrCopy
}
// E.g sort by sortByParam(arr, 'deadline')

// Returns deadline from JS DateTime Object
const getDeadlineFromDate = (dateTimeObject) => {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return `${monthNames[dateTimeObject.getMonth()]} ${dateTimeObject.getDate()}`
}

// Generates array of Line Flex Bubble message JSON
const generateBubbles = (arr) =>
  arr.map((subject) => {
    return {
      type: 'bubble',
      direction: 'ltr',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: subject['title'],
            weight: 'bold',
            size: 'xxl',
            align: 'center',
            gravity: 'center',
            color: '#000000',
            wrap: true,
          },
        ],
        backgroundColor: '#FFFFFF', //
        cornerRadius: '0px',
      },
      hero: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text:
              '📅 Deadline' +
              getDeadlineFromDate(sortByParam(Object.values(JSON.parse(JSON.stringify(subject))['assignments']), 'deadline')[0]['deadline']),
            size: 'lg',
            align: 'center',
            gravity: 'center',
            contents: [
              {
                type: 'span',
                text: '📅 Deadline: ',
              },
              {
                type: 'span',
                text: getDeadlineFromDate(sortByParam(Object.values(JSON.parse(JSON.stringify(subject))['assignments']), 'deadline')[0]['deadline']),
                weight: 'regular',
              },
            ],
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'separator',
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            action: {
              type: 'postback',
              label: 'View Solution',
              data: `homework/${subject['title']}`,
            },
            gravity: 'center',
            style: 'secondary',
          },
        ],
        backgroundColor: '#FFFFFF',
      },
      size: 'kilo',
      styles: {
        header: {
          backgroundColor: '#ffaaaa',
          separator: false,
        },
        body: {
          backgroundColor: '#ffffff',
        },
        footer: {
          backgroundColor: '#aaaaff',
        },
      },
    }
  })

// Generate a message containing a list of subjects
const generateSubjectList = (courses) => ({
  type: 'text',
  text: 'Select from the following:\n' + courses.map((course) => '- ' + course['title']).join('\n'),
})

// Gets the local datetime from a UTC datetime
const getLocalFromUTC = (UTCDateTime) => moment(UTCDateTime).tz('Asia/Bangkok')

// Download the file from URL (Must catch error)
const downloadFileFromURL = async (URL, outputFileName) => {
  let buffer = await request.get({ uri: URL, encoding: null })
  fs.writeFile(outputFileName, buffer, (e) => (e ? console.error(e) : null))
}

const shortenURL = async (URL) => {
  const response = await request.post({
    uri: 'https://api-ssl.bitly.com/v4/shorten',
    headers: `Bearer ${config.bitly_token}`,
    body: URL,
  })
  return response.link
}

const getClicksFromURL = async (URL) => {
  URL = URL.replace(/(^\w+:|^)\/\//, '')
  const response = await request.post({
    uri: `https://api-ssl.bitly.com/v4/bitlinks/${URL}/clicks/summary`,
  })
  return response.total_clicks
}

// Remove file from specified path
const removeFile = (path) => fs.unlink(path, (e) => (e ? console.error(e) : null))

// Function exports
module.exports = {
  generateHomework,
  generateSubjectList,
  getLocalFromUTC,
  downloadFileFromURL,
  removeFile,
}
