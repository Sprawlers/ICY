const moment = require('moment-timezone')
const fs = require('fs')
const request = require('request-promise')
const config = '../config.js'
const bubble = require('../json/homeworkJSON.json')

// Generate JSON payload from array of homework object
const generateHomework = (arr) => ({
    type: 'flex',
    altText: 'homework',
    contents: {
        type: 'carousel',
        contents: generateBubbles(arr),
    },
})

/* WORK IN PROGRESS
// Generate message payload (to be changed to JSON) from array of course notes
const generateNotes = (arr) => {
    const str = arr.map(subject => {

    })
    // Return the text message payload
    return {
        type: 'text',
        text: `${title}\n${str}`,
    }
}*/

// Generate subject-specific JSON payload of assignment list given array of homework object and subject name
const generateAssignments = async (arr, title) => {
    // Obtain object of assignment objects
    const assignments = JSON.parse(JSON.stringify(...arr.filter((obj) => obj['title'] === title)))['assignments']
    // Construct a new array of objects from assignments for sorting
    const mapped = await Object.keys(assignments).map(async (task) => ({
        task: task,
        link: await shortenURL(assignments[task]['link']),
        deadline: assignments[task]['deadline'],
    }))
    // Obtain array of mapped objects and sort the assignments by their deadline
    const sorted = sortByParam(mapped, 'deadline')
    // Format the array into a readable string
    const str = sorted.map((task) => {
        // Checks if the homework is past due date
        const isOverdue = new Date(task['deadline']) - new Date(Date.now()) < 0
        // Store date/overdue status
        const status =
            isOverdue ? "✅" :
                "(📅 " + getDeadlineFromDate(new Date(task['deadline']))
                + " " + getLocalTimeFromDate(new Date(task['deadline'])) + ")"
        // Returns message
        return ("-" + task['task'] + ": " + task['link'] + " " + status)
    }).join('\n')
    // Return the text message payload
    return {
        type: 'text',
        text: `${title}\n${str}`,
    }
}

// Function to sort array of objects by parameter
const sortByParam = (arr, param) => {
    const arrCopy = [...arr]
    arrCopy.sort((a, b) => {
        if(!a[param]) return 1
        let dateA = new Date(a[param])
        if(!b[param]) return -1
        let dateB = new Date(b[param])
        return dateA - dateB
    })
    return arrCopy
}
// E.g sort by sortByParam(arr, 'deadline')

// Returns deadline in {(Month) (Day)} format from JS DateTime Object
const getDeadlineFromDate = (dateTimeObject) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return `${monthNames[dateTimeObject.getMonth()]} ${dateTimeObject.getDate()}`
}

// Returns local time in HH:MM format from JS DateTime Object
const getLocalTimeFromDate = (dateTimeObject) => moment(dateTimeObject).tz('Asia/Bangkok').format('HH:mm');

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

// Converts object of objects into an array of objects
const toArray = (obj_obj) => Object.keys(obj_obj).map((i) => obj_obj[i])

// Returns array of subjects with assignments sorted by deadline
const getSubjectAssignmentsSorted = (arr) =>
    arr.map((subject) => {
        const assignments = toArray(JSON.parse(JSON.stringify(subject))['assignments'])
        const sorted = sortByParam(assignments, 'deadline')
            .filter(subject => new Date(subject['deadline']) - new Date(Date.now()) > 0)
        return {
            title: subject['title'],
            latest: sorted.length? sorted[0]['deadline']: false
        }
    })

// Generates array of Line Flex Bubble message JSON
const generateBubbles = (arr) => {
    const subjects = sortByParam(getSubjectAssignmentsSorted(arr), 'latest')
    return subjects.map((subject) => {
        let bubbleClone = clone(bubble)
        const displayedDeadline = subject['latest']? getDeadlineFromDate(new Date(subject['latest'])): "-"
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

// Download the file from URL (Must catch error)
const downloadFileFromURL = async (URL, outputFileName) => {
    let buffer = await request.get({uri: URL, encoding: null})
    fs.writeFile(outputFileName, buffer, (e) => (e ? console.error(e) : null))
}

// Shorten a URL using bit.ly
const shortenURL = async (URL) => {
    const response = await request.post({
        uri: 'https://api-ssl.bitly.com/v4/shorten',
        headers: `Bearer ${config['bitly_token']}`,
        body: URL,
    })
    return response.link
}

// Get the number of clicks from a shortened links
const getClicksFromURL = async (URL) => {
    URL = URL.replace(/(^\w+:|^)\/\//, '')
    const response = await request.post({
        uri: `https://api-ssl.bitly.com/v4/bitlinks/${URL}/clicks/summary`,
    })
    return response['total_clicks']
}

// Remove file from specified path
const removeFile = (path) => fs.unlink(path, (e) => (e ? console.error(e) : null))

// Function exports
module.exports = {
    generateHomework,
    generateSubjectList,
    generateAssignments,
    getLocalFromUTC,
    downloadFileFromURL,
    removeFile,
}
