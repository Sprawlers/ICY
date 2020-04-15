const Chart = require('chart.js')

var lineChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: options
});