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

const getDeadlineFromObject = (dateTimeObject) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[dateTimeObject.getMonth()]} ${dateTimeObject.getDate()}`
};

const generateBubbles = (arr) =>
    arr.map(obj => ({
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
                    "text": `📅 Deadline ${getDeadlineFromObject(obj['deadline'])}`,
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
                            "text": getDeadlineFromObject(obj['deadline']),
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
                        "uri": obj['link'],
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
    }));

module.exports = {generateHomework};
