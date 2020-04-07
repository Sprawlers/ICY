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
    "type": "flex",
    "altText": "homework",
    "contents": {
        "type": "carousel",
        "contents": generateBubbles(arr),
    },
});

const getDeadlineFromDate = (dateTimeObject) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[dateTimeObject.getMonth()]} ${dateTimeObject.getDate()}`
};

const generateBubbles = (arr) =>
    arr.map(obj => {
        console.log("DEBUG:")
        console.log("Title: " + obj['title'])
        console.log("Deadline: " + obj['deadline'])
        console.log("Links: " + Object.keys(obj['links'])[0])
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
                            "uri": Object.keys(obj['links'])[0],
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

module.exports = {generateHomework};
