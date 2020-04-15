const processDataForGraph = arr =>
    arr.map(voter => voter["createdAt"]).map((time, count) => {
        console.log(time);
        return ({
            x: (new Date(time)).toString(),
            y: count + 1
        })
    })


module.exports = {
    processDataForGraph
}