const processDataForGraph = arr =>
    arr.map(voter => voter["createdAt"]).map((time, count) => {
        console.log(time);
        return ({
            x: new Date(time),
            y: count + 1
        })
    })

const normalizeLatestTime = (arr1, arr2) => {
    if(arr1[arr1.length - 1]["x"].getTime() > arr2[arr2.length - 1]["x"].getTime()) {
        arr2.push({
            x: arr1[arr1.length - 1]["x"],
            y: arr2.length
        })
    } else {
        arr1.push({
            x: arr2[arr2.length - 1]["x"],
            y: arr1.length
        })
    }
}


module.exports = {
    processDataForGraph,
    normalizeLatestTime
}