const moment = require('moment-timezone')
const request = require('request-promise')
const config = require('../config')

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
    let response = await request.get({
        uri: `https://api-ssl.bitly.com/v4/bitlinks/${URL}/clicks/summary`,
        headers: {
            Authorization: `Bearer ${config.bitly_token}`,
        },
        json: true,
    })
    return response.total_clicks
}
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
} // deep clone
const getDeadlineFromDate = (dateTimeObject) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return monthNames[dateTimeObject.getMonth()] + ' ' + dateTimeObject.getDate()
} // format "{month} {day}"
const getLocalTimeFromDate = (dateTimeObject) => moment(dateTimeObject).tz('Asia/Bangkok').format('HH:mm')
const getLocalFromUTC = (UTCDateTime) => moment(UTCDateTime).tz('Asia/Bangkok')
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

module.exports = {
    shortenURL,
    getClicksFromURL,
    clone,
    getDeadlineFromDate,
    getLocalTimeFromDate,
    getLocalFromUTC,
    sortByParam
}