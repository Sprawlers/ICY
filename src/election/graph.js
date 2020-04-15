const Chart = require('chart.js')

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