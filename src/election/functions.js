const processDataForGraph = arr =>
    arr.map(voter => voter["createdAt"]).map((time, count) => {
        console.log(time);
        return ({
            x: new Date(time),
            y: count + 1
        })
    })

const normalizeLatestTime = (arr1, arr2) => {
    arr1.push({
        x: new Date(Date.now()),
        y: arr1.length + 1
    })
    arr2.push({
        x: new Date(Date.now()),
        y: arr2.length + 1
    })
}


module.exports = {
    processDataForGraph,
    normalizeLatestTime
}