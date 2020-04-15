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
        arr2.push(arr2[arr2.length - 1]["x"])
    } else {
        arr1.push(arr1[arr1.length - 1]["x"])
    }
}


module.exports = {
    processDataForGraph,
    normalizeLatestTime
}