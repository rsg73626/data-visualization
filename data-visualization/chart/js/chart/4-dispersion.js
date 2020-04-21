

var HORIZONTAL = 'horizontal_stackedbar_chart'
var VERTICAL = 'vertical_stackedbar_chart'

/**
 * Used to draw a stacked bar chart.
 * @param {String} title 
 * @param {Number} chartAreaWidth 
 * @param {Number} chartAreaHeight 
 * @param {Array} column1 first numerical values array
 * @param {Array} column2 second numerical values array
 * @param {String} horizontalLabel
 * @param {String} verticalLabel
 */
function drawDispersionChart(title, chartAreaWidth, chartAreaHeight, column1, column2, horizontalLabel, verticalLabel, color) {

    var c1Min = column1[0]
    var c1Max = column1[0]

    var c2Min = column2[0]
    var c2Max = column2[0]

    var points = []

    for (i = 1; i < column1.length; i++) {
        if (column1[i] < c1Min) { c1Min = column1[i] }
        if (column1[i] > c1Max) { c1Max = column1[i] }
        if (column2[i] < c2Min) { c2Min = column2[i] }
        if (column2[i] > c2Max) { c2Max = column2[i] }
        points.push({x: column1[i], y: column2[i]})
    }

    var margin = 50

    var pointRadius = 0

    var chartArea = d3.select('#charts').append('article')

    if (typeof title == 'string' && title.trim() != '') {
        chartArea.append('h3')
                    .text(title)
                    .style('margin', '0')
                    .style('padding', '10px')
                    .style('font-family', 'Arial')
    }

    var svg = chartArea.append('svg')
                        .attr('width', chartAreaWidth)
                        .attr('height', chartAreaHeight)

    function drawAxes() {

        var xscale = d3.scaleLinear()
                        .domain([0, c1Max])
                        .range([0, chartAreaWidth - (2 * margin)])

        var yscale = d3.scaleLinear()
                        .domain([0, c2Max])
                        .range([chartAreaHeight - (2 * margin), 0])

        var x_axis = d3.axisBottom().scale(xscale)

        var y_axis = d3.axisLeft().scale(yscale)
        svg.append('g')
                .classed('graph-y-axix', true)
                .attr('transform', 'translate(' + margin + ', ' + margin + ')')
                .call(y_axis)
        
        var xAxisTranslate = chartAreaHeight - margin
        svg.append('g')
                .classed('graph-x-axix', true)
                .attr('transform', 'translate(' + margin + ', ' + xAxisTranslate + ')')
                .call(x_axis)

    }
    
    function drawChart() {

        var startX = margin
        var endX = chartAreaWidth - margin
        var availableWidth = endX - startX

        var startY = margin
        var endY = chartAreaHeight - margin
        var availableHeight = endY - startY

        var availableSpacePerPoint = availableWidth / column1.length
        pointRadius = 10

        widthPerUnit = availableWidth / c1Max
        heightPerUnit = availableHeight / c2Max

        svg.selectAll('g') 
                .data(points)
                .enter()
                    .append('circle')
                        .attr('cx', (point => startX + (point.x * widthPerUnit)))
                        .attr('cy', (point => endY - (point.y * heightPerUnit)))
                        .attr('r', 5)
                        .attr('fill', color)

        svg.append('text')
                .text(verticalLabel)
                .attr('x', margin / 2)
                .attr('y', margin * 0.75)

        svg.append('text')
                .text(horizontalLabel)
                .attr('x', (chartAreaWidth / 2) - (0.5 * margin))
                .attr('y', chartAreaHeight - (margin * 0.25))
        
    }

    drawChart()
    drawAxes()

}

function drawDispersionChartFromCSV(filePath, width, height, column1, column2, color) {

    // title, chartAreaWidth, chartAreaHeight, column1, column2, horizontalLabel, verticalLabel

    var c1 = []
    var c2 = []

    var c1Key = null
    var c2Key = null

    function parse(object) {

        if (c1Key == null || c2Key == null) {
            var keys = d3.keys(object)
            if (column1 >= 0 && column1 < keys.length) { c1Key = keys[column1] } else { c1Key = '' }
            if (column2 >= 0 && column2 < keys.length) { c2Key = keys[column2] } else { c2Key = '' }
        }

        var c1Value = object[c1Key]
        var c2Value = object[c2Key]

        var c1ValueAsNumber = Number(c1Value)
        var c2ValueAsNumber = Number(c2Value)

        if (!isNaN(c1ValueAsNumber) && !isNaN(c2ValueAsNumber)) {
            c1.push(c1ValueAsNumber)
            c2.push(c2ValueAsNumber)
        }

        return object

    }

    function removeRepatedPairs() {

        var pairs = []
        for (i = 0; i < c1.length; i++) {
            pairs.push({c1: c1[i], c2: c2[i]})
        }

        c1 = []
        c2 = []

        var filteredPairs = []
        pairs.forEach(function(pair) {
            var alredyHasPair = false
            for (j = 0; j < filteredPairs.length; j++) {
                var filteredPair = filteredPairs[j]
                if ((pair.c1 < 0 ||  pair.c2 < 0) || 
                    (pair.c1 == filteredPair.c1 &&  pair.c2 == filteredPair.c2)) {
                    alredyHasPair = true
                    break
                }
                
            }
            if (!alredyHasPair) {
                filteredPairs.push(pair)
                c1.push(pair.c1)
                c2.push(pair.c2)
            } else {
                alredyHasPair = false
            }
        })
    }

    d3.dsv(';', filePath, null, parse).then(function(data) {
        if (data.length > 0 || c1.length != c2.length) {
            if (c1.length == 0) {
                logAndAddError('The column positions must be numerical values from 0 to number of table columns minus 1. For exemplo: 0. The column must contains only numbers.')
                return
            }
            removeRepatedPairs()
            if (c1.length == 0) {
                logAndAddError('Couldn\'t read the selected columns. They must contain only positive numerical values (it does not support negative values yet).')
                return
            } 
            drawDispersionChart('Dispersion chart from ' + filePath, width, height, c1, c2, c1Key, c2Key, color) 
        } else {
            logAndAddError('Couldn\'d read the file.')
        }
    });

}

