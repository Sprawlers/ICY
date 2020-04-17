const moment = require('moment-timezone')
const Promise = require('bluebird')
const request = require('request-promise')
const config = require('../config')
const homeworkBubble = require('../json/homeworkJSON.json')
const flexMessage = require('../json/flexTemplate.json')
const taskJSON = require('../json/homeworkTasksJSON.json')

const generateCarousel = async (arr, altText, callback) => ({
    ...flexMessage,
    altText,
    contents: {type: "carousel", contents: await callback(arr)}
})

const generateHomeworkJSON = async arr => await generateCarousel(arr, "homework", generateHomeworkBubbles)
const generateNotesJSON = arr => generateCarousel(arr, "notes", generateNotesBubbles)

const generateNotesBubbles = async (arr) => {
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

const generateTasksJSON = async (assignments) => {

    const sorted = sortByParam(assignments, 'deadline')

    return await Promise.map(sorted, async task => {
        let json = clone(taskJSON)
        let [ name, btn ] = [...json.contents]
        const isOverdue = new Date(task.deadline) - new Date(Date.now()) < 0
        const status = isOverdue
            ? '✅'
            : getDeadlineFromDate(new Date(task.deadline)) + ' ' + getLocalTimeFromDate(new Date(task.deadline))
        name.contents[0].text = task.name
        name.contents[1].contents[1].text = status.toUpperCase()
        btn.url = await shortenURL(task.link)
        json.contents = [ name, btn ]
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

// Returns deadline in {(Month) (Day)} format
const getDeadlineFromDate = (dateTimeObject) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return monthNames[dateTimeObject.getMonth()] + ' '  + dateTimeObject.getDate()
}

// Local time string in HH:MM format
const getLocalTimeFromDate = (dateTimeObject) => moment(dateTimeObject).tz('Asia/Bangkok').format('HH:mm')

// Deep Clone
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

    return temp
}

const getSubjectsSorted = (arr) =>
    arr.map(subject => {
        const sorted = sortByParam(subject.assignments, 'deadline')
            .filter(task => new Date(task.deadline) - new Date(Date.now()) > 0)
        return {
            title: subject.title,
            assignments: subject.assignments,
            latest: sorted.length ? sorted[0].deadline : false,
        }
    })

// INPUT: [ { title: subjectName, assignments: <arr> }, … ]
const generateHomeworkBubbles = async arr => {
    const subjects = sortByParam(getSubjectsSorted(arr), 'latest')
    return await Promise.map(subjects , async (subject) => {
        let bubble = clone(homeworkBubble)

        bubble.body.action.data = 'homework/body/' + subject.title // for logging
        bubble.body.contents[1].text = subject.title
        bubble.body.contents = [
            ...bubble.body.contents,
            ...await generateTasksJSON(subject.assignments)
        ]

        return bubble
    })
}

const generateSubjectList = (courses) => ({
    type: 'text',
    text: 'Select from the following:\n' + courses.map((course) => '- ' + course.title).join('\n'),
})

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

const getClicksFromURL = async (URL) => {
    URL = URL.replace(/(^\w+:|^)\/\//, '')
    const response = await request.post({
        uri: `https://api-ssl.bitly.com/v4/bitlinks/${URL}/clicks/summary`,
    })
    return response.total_clicks
}

// Function exports
module.exports = {
    generateHomeworkJSON, // fix this
    generateNotes: generateNotesJSON,
    generateSubjectList,
    getLocalFromUTC,
}
