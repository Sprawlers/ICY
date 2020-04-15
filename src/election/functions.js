const processDataForGraph = arr =>
    arr.map(voter => ({timestamp: voter["createdAt"]})).map((time, count) => ({
        x: new Date(time),
        y: count + 1
    }))


module.exports = {
    processDataForGraph
}