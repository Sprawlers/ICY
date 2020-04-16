const moment = require('moment-timezone')
const Promise = require('bluebird')
const request = require('request-promise')
const config = require('../config')
const bubble = require('../json/homeworkJSON.json')
const flexMessage = require('../json/flexTemplate.json')

const safeParseObject = obj => JSON.parse(JSON.stringify(obj))

const generateHomeworkJSON = (arr) => ({
    ...flexMessage,
    altText: "homework",
    contents: {type: "carousel", contents: generateBubbles(arr)}
})

const generateNotes = async (arr) => {
    let str = await Promise.map(arr, async (course) => {
        let notes = await Promise.map(course.notes, async (note) => {
            const shortenedURL = await shortenURL(note.link)
            return '- ' + note.name + ': ' + shortenedURL
        })
        notes = notes.join('\n')
        return course.title + '\n' + notes
    })
    str = str.join('\n')
    return {
        type: 'text',
        text: '📕 NOTES 📕\n' + str
    }
}

// Generate subject-specific JSON payload of assignment list given array of homework object and subject name
const generateAssignments = async (arr, subjectName) => {
    const assignments = arr.find(subject => subject.title === subjectName).assignments
    const sorted = sortByParam(assignments, 'deadline')
    const str = await Promise.map(sorted, async task => {
        const isOverdue = new Date(task.deadline) - new Date(Date.now()) < 0
        const status = isOverdue
            ? '✅'
            : '(📅 ' + getDeadlineFromDate(new Date(task.deadline)) + ' ' + getLocalTimeFromDate(new Date(task.deadline)) + ')'
        return '-' + task.name + ': ' + task.link + ' ' + status
    })
        .join('\n')
    return {
        type: 'text',
        text: subjectName + '\n' + str,
    }
}

// Function to sort array of objects by parameter
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
// E.g sort by sortByParam(arr, 'deadline')

// Returns deadline in {(Month) (Day)} format from JS DateTime Object
const getDeadlineFromDate = (dateTimeObject) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return monthNames[dateTimeObject.getMonth()] + ' '  + dateTimeObject.getDate()
}

// Returns local time in HH:MM format from JS DateTime Object
const getLocalTimeFromDate = (dateTimeObject) => moment(dateTimeObject).tz('Asia/Bangkok').format('HH:mm')

// Deep Clone Function
const clone = (obj) => {
    if (obj === null || typeof obj !== 'object' || 'isActiveClone' in obj) return obj

    const temp = obj instanceof Date ? new obj.constructor() : obj.constructor()

    Object.keys(obj).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            obj['isActiveClone'] = null
            temp[key] = clone(obj[key])
            delete obj['isActiveClone']
        }
    })

    return temp
}

// Returns array of subjects with assignments sorted by deadline
const getSubjectAssignmentsSorted = (arr) =>
    arr.map((subject) => {
        const sorted = sortByParam(subject.assignments, 'deadline')
            .filter(subject => new Date(subject.deadline) - new Date(Date.now()) > 0)
        return {
            title: subject.title,
            latest: sorted.length ? sorted[0].deadline : false,
        }
    })

// Generates array of Line Flex Bubble message JSON
const generateBubbles = (arr) => {
    const subjects = sortByParam(getSubjectAssignmentsSorted(arr), 'latest')
    return subjects.map((subject) => {
        let bubbleClone = clone(bubble)
        const displayedDeadline = subject['latest'] ? getDeadlineFromDate(new Date(subject['latest'])) : '-'
        // Set subject title
        bubbleClone['header']['contents'][0]['text'] = subject['title']
        bubbleClone['header']['contents'][0]['action']['data'] = `homework/header/${subject['title']}`

        // Set subject deadline
        bubbleClone['hero']['contents'][0]['text'] = '📅 Deadline' + displayedDeadline
        bubbleClone['hero']['contents'][0]['contents'][0]['text'] = '📅 Deadline: '
        bubbleClone['hero']['contents'][0]['contents'][1]['text'] = displayedDeadline
        bubbleClone['hero']['contents'][0]['action']['data'] = `homework/hero/${subject['title']}`

        // Set post-back
        bubbleClone['footer']['contents'][0]['action']['data'] = `homework/solution/${subject['title']}`
        return bubbleClone
    })
}

// Generate a message containing a list of subjects
const generateSubjectList = (courses) => ({
    type: 'text',
    text: 'Select from the following:\n' + courses.map((course) => '- ' + course['title']).join('\n'),
})

// Gets the local datetime from a UTC datetime
const getLocalFromUTC = (UTCDateTime) => moment(UTCDateTime).tz('Asia/Bangkok')

// Shorten a URL using bit.ly
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
    return response['link']
}

// Get the number of clicks from a shortened links
const getClicksFromURL = async (URL) => {
    URL = URL.replace(/(^\w+:|^)\/\//, '')
    const response = await request.post({
        uri: `https://api-ssl.bitly.com/v4/bitlinks/${URL}/clicks/summary`,
    })
    return response['total_clicks']
}

// Function exports
module.exports = {
    generateHomeworkJSON, // fix this
    generateNotes,
    generateSubjectList,
    generateAssignments,
    getLocalFromUTC,
}
