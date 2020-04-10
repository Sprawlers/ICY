const moment = require('moment-timezone')
const fs = require('fs')
const request = require('request-promise')

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
const generateHomework = arr => ({
    "type": "flex",
    "altText": "homework",
    "contents": {
        "type": "carousel",
        "contents": generateBubbles(sortByDeadline(arr)),
    },
});

// Function to sort homeworkObjectArray by deadline
const sortByDeadline = arr => {
    const arrCopy = [...arr]
    arrCopy.sort((a, b) => {
        let dateA = new Date(a['deadline']);
        let dateB = new Date(b['deadline']);
        return dateA - dateB;
    })
    return arrCopy
};

// Returns deadline from JS DateTime Object
const getDeadlineFromDate = dateTimeObject => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[dateTimeObject.getMonth()]} ${dateTimeObject.getDate()}`
};

// Generates array of Line Flex Bubble message JSON
const generateBubbles = arr =>
    arr.map(obj => {
        return ({
            "type": "bubble",
            "direction": "ltr",
            "header": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "text",
                        "text": obj['title'],
                        "weight": "bold",
                        "size": "xxl",
                        "align": "center",
                        "gravity": "center",
                        "color": "#000000",
                        "wrap": true,
                    },
                ],
                "backgroundColor": "#FFFFFF",
                "cornerRadius": "0px"
            },
            "hero": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "text",
                        "text": `📅 Deadline ${getDeadlineFromDate(obj['deadline'])}`,
                        "size": "lg",
                        "align": "center",
                        "gravity": "center",
                        "contents": [
                            {
                                "type": "span",
                                "text": "📅 Deadline: ",
                            },
                            {
                                "type": "span",
                                "text": getDeadlineFromDate(obj['deadline']),
                                "weight": "regular",
                            },
                        ],
                    },
                ],
            },
            "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "separator",
                    },
                ],
            },
            "footer": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                    {
                        "type": "button",
                        "action": {
                            "type": "uri",
                            "uri": obj['links'][Object.keys(obj['links'])[0]], // Need to fix this to be more elegant!!
                            "label": "View Solution",
                        },
                        "gravity": "center",
                        "style": "secondary",
                    },
                ],
                "backgroundColor": "#FFFFFF",
            },
            "size": "kilo",
            "styles": {
                "header": {
                    "backgroundColor": "#ffaaaa",
                    "separator": false,
                },
                "body": {
                    "backgroundColor": "#ffffff",
                },
                "footer": {
                    "backgroundColor": "#aaaaff",
                },
            },
        })
    });

// Generate a message containing a list of subjects
const generateSubjectList = () => {

}

// Gets the local datetime from a UTC datetime
const getLocalFromUTC = UTCDateTime => moment(UTCDateTime).tz('Asia/Bangkok')

// Download the PDF from URL
const downloadPDFFromURL = async (pdfURL, outputFileName) => {
    let pdfBuffer = await request.get({uri: pdfURL, encoding: null})
    fs.writeFile(outputFileName, pdfBuffer, e => e?console.error(e):null)
}

// Remove file from specified path
const removeFile = path => fs.unlink(path, e => e?console.error(e):null)

// Function exports
module.exports = {generateHomework, getLocalFromUTC, downloadPDFFromURL, removeFile};
