const Chart = require('chart.js')
const moment = require('moment')

const data = {
    labels: hours,
    datasets: [
        {
            data: team1,
            data: team2
        }
    ]
}

const lineChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: options
});