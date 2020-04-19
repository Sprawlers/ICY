const Promise = require('bluebird')
const flexMessage = require('../json/flexTemplate.json')
const {JSONfile} = require('../json/JSONcontroller')
const util = require('./utility')

const generateCarousel = async (altText, bubbles) => ({
    ...flexMessage,
    altText,
    contents: {type: 'carousel', contents: await bubbles},
})

const generateHomeworkJSON = async (arr) => {
    return await generateCarousel('Homework',
        generateTemplateA(arr, 'hw', generateTasksJSON, ['homework/', 'Homework Solutions for'])
    )
}
const generateNotesJSON = async (arr) => {
    return await generateCarousel('Notes',
        generateTemplateA(arr, 'notes', generateEachNotesJSON, ['notes/', 'Notes and Texts for'])
    )
}
const generateRegularMessageJSON = msg => {
    const json = util.clone(JSONfile('regular_message'))
    json.altText = json.contents.body.contents[0].text = msg
    return json
}
const generateExamMessageJSON = arr => {
    const sorted = util.sortByParam(arr, 'date')
    const json = util.clone(JSONfile('exams'))
    json.contents.body.contents = [...json.contents.body.contents, ...generateEachExamsJSON(sorted)]
    return json
}
const generateEachExamsJSON = arr => arr.map(obj => {
    const json = util.clone(JSONfile('singleExam'))
    let [left, right] = json.contents
    let time = util.getLocalTimeFromDate(new Date(obj.date))
    if (new Date(obj.date).getUTCHours() === 0 && new Date(obj.date).getUTCMinutes() === 0)
        time = "TBA"
    const duration = (obj.duration === 0)?'':' (' + obj.duration + 'm)'
    left.contents[0].text = obj.title
    left.contents[1].text = obj.name
    right.contents[0].text = util.getDeadlineFromDate(new Date(obj.date))
    right.contents[1].text = time + duration
    json.contents = [left, right]
    return json
})

// INPUT example: [ { title: subjectName, <assignments/notes>: <arr> }, … ]
const generateTemplateA = async (arr, type, callback, data = ['Subheading', 'Heading']) => {
    let [subjects, callbackParam] = [arr, null]
    switch (type) {
        case 'hw':
            [subjects, callbackParam] = [util.sortByParam(getSubjectsSorted(arr), 'latest'), "assignments"]
            break
        case 'notes':
            callbackParam = "notes"
            break
    }
    return await Promise.map(subjects, async (subject) => {
        let bubble = util.clone(JSONfile('TemplateA'))

        bubble.body.contents[0].text = data[1]
        bubble.body.contents[0].action.data = data[0] + 'header/' + subject.title
        bubble.body.contents[1].text = subject.title
        bubble.body.contents[1].action.data = data[0] + 'subheader/' + subject.title
        switch (type) {
            case 'hw':
                bubble.body.contents = [
                    ...bubble.body.contents,
                    ...(await callback(subject[callbackParam]))
                ]
                break
            case 'notes':
                let notesContent = await callback(subject[callbackParam].filter(task => task.type === "Note"))
                let textContent = await callback(subject[callbackParam].filter(task => task.type === "Textbook"))
                if(notesContent.length !== 0) bubble.body.contents = [...bubble.body.contents, ...notesContent]
                if(textContent.length !== 0) bubble.body.contents = [...bubble.body.contents, ...textContent]
        }
        return bubble
    })
}
const generateTemplateB = async (templateMap, data) => await Promise.map(templateMap, async (obj) => {
    let json = util.clone(JSONfile('TemplateB'))
    json.contents[0].action.data = data + '/name/' + obj.left.title
    json.contents[1].action.data = data + '/author/' + obj.middle.title
    let [left, middle, right] = [...json.contents]
    left.contents[0].text = obj.left.title
    left.contents[1].contents[0].text = obj.left.subtitle[0]
    left.contents[1].contents[1].text = obj.left.subtitle[1]
    middle.contents[0].text = obj.middle.title
    middle.contents[1].text = obj.middle.subtitle
    right.action.uri = await util.shortenURL(obj.right.uri)
    json.contents = [left, middle, right]
    return json
})

const generateTasksJSON = async (assignments) => {
    const sorted = sortByDateWithExpiry(assignments, 'deadline')
    const templateMap = sorted.map(task => {
        const isOverdue = new Date(task.deadline) - new Date(Date.now()) < 0
        const status = isOverdue
            ? '✅'
            : util.getDeadlineFromDate(new Date(task.deadline)).toUpperCase() + ' at ' + util.getLocalTimeFromDate(new Date(task.deadline))
        const [left, middle, right] = [{
            title: task.name,
            subtitle: ['Due', status]
        }, {
            title: task.author.name,
            subtitle: task.author.major
        }, {
            uri: task.link
        }]
        return {left, middle, right}
    })
    return await generateTemplateB(templateMap, 'homework')
}
const generateEachNotesJSON = async (notes) => {
    const templateMap = notes.map(note => {
        const [left, middle, right] = [{
            title: note.name,
            subtitle: [note.type, ' ']
        }, {
            title: note.author !== undefined ? note.author.name : ' ',
            subtitle: note.author !== undefined ? note.author.major : ' '
        }, {
            uri: note.link
        }]
        return {left, middle, right}
    })
    return await generateTemplateB(templateMap, 'notes')
}

const sortByDateWithExpiry = (arr, param) => {
    const arrCopy = [...arr]
    arrCopy.sort((a, b) => {
        if(new Date(a[param]) - new Date(Date.now()) < 0) return 1
        if(new Date(b[param]) - new Date(Date.now()) < 0) return -1
        return new Date(a[param]) - new Date(b[param])
    })
    return arrCopy
}

const getSubjectsSorted = (arr) =>
    arr.map((subject) => {
        const sorted = util.sortByParam(subject.assignments, 'deadline').filter((task) => new Date(task.deadline) - new Date(Date.now()) > 0)
        return {
            title: subject.title,
            assignments: subject.assignments,
            latest: sorted.length ? sorted[0].deadline : false,
        }
    })
const generateSubjectList = (courses) => ({
    type: 'text',
    text: 'Select from the following:\n' + courses.map((course) => '- ' + course.title).join('\n'),
})

const generateStats = async (hwArr, notesArr) => {
    const hwLinks = await getClickedLinksStrings(hwArr, 'assignments')
    const notesLinks = await getClickedLinksStrings(notesArr, 'notes')
    return {
        type: 'text',
        text: '📕 HOMEWORK\n\n' + hwLinks + '\n\n🗒 NOTE\n\n' + notesLinks,
    }
}
const getClickedLinksStrings = async (arr, param) => {
    let mapped = (await Promise.map(arr, async (course) => {
        let mapped = (await Promise.map(
            course[param],
            async (obj) => '- "' + obj.name + '": ' + (await util.getClicksFromURL(await util.shortenURL(obj.link))) + ' clicks'
        ))
        return '▸ ' + course.title + ':\n' + mapped.join('\n')
    }))
    return mapped.join('\n')
}

// Function exports
module.exports = {
    generateHomeworkJSON, // fix this
    generateNotesJSON,
    generateRegularMessageJSON,
    generateExamMessageJSON,
    generateSubjectList,
    getLocalFromUTC: util.getLocalFromUTC,
    generateStats,
}
