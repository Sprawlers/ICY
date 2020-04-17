const moment = require('moment-timezone')
const Promise = require('bluebird')
const request = require('request-promise')
const config = require('../config')
const homeworkBubble = require('../json/homeworkJSON.json')
const flexMessage = require('../json/flexTemplate.json')
const taskJSON = require('../json/homeworkTasksJSON.json')
const notesBubble = require('../json/notesJSON.json')
const eachNotesJSON = require('../json/notesEachNotesJSON.json')

const generateCarousel = async (arr, altText, callback) => ({
  ...flexMessage,
  altText,
  contents: { type: 'carousel', contents: await callback(arr) },
})

const generateHomeworkJSON = async (arr) => await generateCarousel(arr, 'homework', generateHomeworkBubbles)
const generateNotesJSON = async (arr) => await generateCarousel(arr, 'notes', generateNotesBubbles)

// INPUT: [ { title: subjectName, assignments: <arr> }, … ]
const generateHomeworkBubbles = async (arr) => {
    const subjects = sortByParam(getSubjectsSorted(arr), 'latest')
    return await Promise.map(subjects, async (subject) => {
        let bubble = clone(homeworkBubble)

        bubble.body.action.data = 'homework/body/' + subject.title // for logging
        bubble.body.contents[1].text = subject.title
        bubble.body.contents = [...bubble.body.contents, ...(await generateTasksJSON(subject.assignments))]

        return bubble
    })
}
const generateNotesBubbles = async (arr) => {
  return await Promise.map(arr, async (subject) => {
    let bubble = clone(notesBubble)

    bubble.body.action.data = 'notes/body/' + subject.title // for logging
    bubble.body.contents[1].text = subject.title
    bubble.body.contents = [...bubble.body.contents, ...(await generateEachNotesJSON(subject.notes))]

    return bubble
  })
}

<<<<<<< HEAD
=======
const generateEachNotesJSON = async (notes) => {
  return await Promise.map(notes, async (task) => {
    let json = clone(eachNotesJSON)
    let [name, btn] = [...json.contents]
    name.contents[0].text = task.name
    btn.action.label = '-'
    btn.action.uri = await shortenURL(task.link)
    json.contents = [name, btn]
    return json
  })
}

>>>>>>> a8a6dbc155dca158b97692cde4b174e6cd854d6f
const generateTasksJSON = async (assignments) => {
  const sorted = sortByParam(assignments, 'deadline')

  return await Promise.map(sorted, async (task) => {
    let json = clone(taskJSON)
    let [name, btn] = [...json.contents]
    const isOverdue = new Date(task.deadline) - new Date(Date.now()) < 0
    const status = isOverdue
      ? '✅'
      : getDeadlineFromDate(new Date(task.deadline)).toUpperCase() + ' at ' + getLocalTimeFromDate(new Date(task.deadline))
    name.contents[0].text = task.name
    name.contents[1].contents[1].text = status
    btn.action.label = '-'
    btn.action.uri = await shortenURL(task.link)
    json.contents = [name, btn]
    return json
  })
}
const generateEachNotesJSON = async (notes) => {
    return await Promise.map(notes, async (task) => {
        let json = clone(eachNotesJSON)
        let [name, btn] = [...json.contents]
        name.contents[0].text = task.name
        btn.action.label = '-'
        btn.action.uri = await shortenURL(task.link)
        json.contents = [name, btn]
        return json
    })
}

const sortByParam = (arr, param) => {
  const arrCopy = [...arr]
  arrCopy.sort((a, b) => {
    if (!a[param]) return 1
    let dateA = new Date(a[param])
    if (!b[param]) return -1
    let dateB = new Date(b[param])
    return dateA - dateB
  })
  return arrCopy
}

const getDeadlineFromDate = (dateTimeObject) => {
<<<<<<< HEAD
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return monthNames[dateTimeObject.getMonth()] + ' ' + dateTimeObject.getDate()
} // format "{month} {day}"
=======
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return monthNames[dateTimeObject.getMonth()] + ' ' + dateTimeObject.getDate()
}

// Local time string in HH:MM format
>>>>>>> a8a6dbc155dca158b97692cde4b174e6cd854d6f
const getLocalTimeFromDate = (dateTimeObject) => moment(dateTimeObject).tz('Asia/Bangkok').format('HH:mm')
const getLocalFromUTC = (UTCDateTime) => moment(UTCDateTime).tz('Asia/Bangkok')

const clone = (obj) => {
  if (obj === null || typeof obj !== 'object' || 'isActiveClone' in obj) return obj

  const temp = obj instanceof Date ? new obj.constructor() : obj.constructor()

  Object.keys(obj).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      obj.isActiveClone = null
      temp[key] = clone(obj[key])
      delete obj.isActiveClone
    }
  })

<<<<<<< HEAD
    return temp
} // deep clone

const getSubjectsSorted = (arr) =>
    arr.map((subject) => {
        const sorted = sortByParam(subject.assignments, 'deadline').filter((task) => new Date(task.deadline) - new Date(Date.now()) > 0)
        return {
            title: subject.title,
            assignments: subject.assignments,
            latest: sorted.length ? sorted[0].deadline : false,
        }
    })
=======
  return temp
}

const getSubjectsSorted = (arr) =>
  arr.map((subject) => {
    const sorted = sortByParam(subject.assignments, 'deadline').filter((task) => new Date(task.deadline) - new Date(Date.now()) > 0)
    return {
      title: subject.title,
      assignments: subject.assignments,
      latest: sorted.length ? sorted[0].deadline : false,
    }
  })

// INPUT: [ { title: subjectName, assignments: <arr> }, … ]
const generateHomeworkBubbles = async (arr) => {
  const subjects = sortByParam(getSubjectsSorted(arr), 'latest')
  return await Promise.map(subjects, async (subject) => {
    let bubble = clone(homeworkBubble)

    bubble.body.action.data = 'homework/body/' + subject.title // for logging
    bubble.body.contents[1].text = subject.title
    bubble.body.contents = [...bubble.body.contents, ...(await generateTasksJSON(subject.assignments))]

    return bubble
  })
}

>>>>>>> a8a6dbc155dca158b97692cde4b174e6cd854d6f
const generateSubjectList = (courses) => ({
  type: 'text',
  text: 'Select from the following:\n' + courses.map((course) => '- ' + course.title).join('\n'),
})

<<<<<<< HEAD
=======
const getLocalFromUTC = (UTCDateTime) => moment(UTCDateTime).tz('Asia/Bangkok')

const shortenURL = async (URL) => {
  const response = await request.post({
    uri: 'https://api-ssl.bitly.com/v4/shorten',
    headers: {
      Authorization: `Bearer ${config.bitly_token}`,
    },
    body: {
      long_url: URL,
    },
    json: true,
  })
  return response.link
}

>>>>>>> a8a6dbc155dca158b97692cde4b174e6cd854d6f
const generateStats = async (hwArr, notesArr) => {
  // DUPLICATED CODE NEEDS FIXING
  let str = ''
  str += 'Homework Links:\n'
  str += await Promise.map(hwArr, async (course) => {
    str += course.title + ':\n'
    await Promise.map(course.assignments, async (obj) => {
      str += '- "' + obj.name + '": ' + (await getClicksFromURL(await shortenURL(obj.link))) + ' clicks\n'
    })
  })
  str += '\nNote Links:\n'
  str += await Promise.map(notesArr, async (course) => {
    str += course.title + ':\n'
    await Promise.map(course.notes, async (obj) => {
      str += '- "' + obj.name + '": ' + (await getClicksFromURL(await shortenURL(obj.link))) + ' clicks\n'
    })
  })

<<<<<<< HEAD
    console.log(str)

    return {
        type: 'text',
        text: str,
    }
=======
  return {
    type: 'text',
    text: str,
  }
>>>>>>> a8a6dbc155dca158b97692cde4b174e6cd854d6f
}

const shortenURL = async (URL) => {
    const response = await request.post({
        uri: 'https://api-ssl.bitly.com/v4/shorten',
        headers: {
            Authorization: `Bearer ${config.bitly_token}`,
        },
        body: {
            long_url: URL,
        },
        json: true,
    })
    return response.link
}
const getClicksFromURL = async (URL) => {
  URL = URL.replace(/(^\w+:|^)\/\//, '')
  console.log(URL)
  const response = await request.get({
    uri: `https://api-ssl.bitly.com/v4/bitlinks/${URL}/clicks/summary`,
    headers: {
      Authorization: `Bearer ${config.bitly_token}`,
    },
  })
  return response.total_clicks
}

// Function exports
module.exports = {
  generateHomeworkJSON, // fix this
  generateNotes: generateNotesJSON,
  generateSubjectList,
  getLocalFromUTC,
  generateStats,
}
