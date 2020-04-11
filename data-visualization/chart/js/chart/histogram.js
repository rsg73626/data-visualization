
function drawVerticalBarChart(title, chartAreaWidth, chartAreaHeight, chartData, chartXLabels = []) {

    var margin = 50

    var barWidth = 0

    var heightPerUnit = 0

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
                        .domain([-0.5, chartData.length - 0.5])
                        .range([0, chartAreaWidth - (2 * margin)])

        var yscale = d3.scaleLinear()
                        .domain([0, d3.max(chartData)])
                        .range([chartAreaHeight - (2 * margin), 0])

        var tickValues = []
        for (i = 0; i < chartData.length; i += 1) { tickValues.push(i) }
        var x_axis = d3.axisBottom()
                        .scale(xscale)
                        .tickValues(tickValues)
                        .tickFormat(value => value < chartXLabels.length ? chartXLabels[value] : '-')

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

        var availableSpacePerBar = availableWidth / chartData.length
        barWidth = availableSpacePerBar * 0.9

        heightPerUnit = availableHeight / d3.max(chartData)

        var bar = svg.selectAll('g') 
                    .data(chartData)
                    .enter()
                        .append('g')
                            .attr('transform', 
                                function(d, i) {
                                    var x = startX + (availableSpacePerBar * i)
                                    var y = startY
                                    return 'translate(' + x + ',' + y + ')'
                                }
                            )
        
        bar.append('rect')
                .attr('x', 
                    function(d) {
                        return (availableSpacePerBar / 2) - (barWidth / 2)
                    }
                )
                .attr('y', 
                    function(d) {
                        return availableHeight - (d * heightPerUnit)
                    }
                )
                .attr('width', barWidth)
                .attr('height', 
                    function(d) {
                        return d * heightPerUnit
                    }
                )
                .attr('fill', 'gray')

        bar.append('text')
                .classed('graph-text-value', true)
                .text(
                    function(d) { 
                        return d 
                    }
                )
                .attr('x', 
                    function(d) {
                        return (availableSpacePerBar / 2) - (barWidth / 2) + (barWidth * 0.08)
                    }
                )
                .attr('y', 
                    function(d) {
                        return availableHeight - (d * heightPerUnit) - (margin * 0.1)
                    }
                )
                .style('width', barWidth)
                .style('text-align', 'center')
        
    }

    drawChart()
    drawAxes()

    // changing the value text to vertical
    d3.selectAll('.graph-text-value')
                .attr('transform', d3Transform().rotate(-90))
                .attr('x', function(d) { return (d * heightPerUnit) - chartAreaHeight + (margin * 2) } )
                .attr('y', barWidth * (barWidth <= 20 ? 1 : 0.75))
                .classed('graph-text-value', false)

    // changing the x axis text to vertical
    d3.selectAll('.graph-x-axix .tick text')
                .attr('transform', d3Transform().rotate(-90))
                .attr('x', -25)
                .attr('y', -3)
                .attr('graph-x-axix', false)

}

function drawHistogramChart(chartAreaWidth, chartAreaHeight, chartData, title) {
    if (!Array.isArray(chartData) || chartData.length == 0) {
        logAndAddError('Invalid chart data. It has to be an array with numerical values.')
        return
    }

    var greatest = d3.max(chartData) ////;console.log(greatest)
    var lowest = d3.min(chartData) ////;console.log(lowest)
    var amplitude = greatest - lowest ////;console.log(amplitude)
    var k = Math.round(Math.sqrt(chartData.length)) //;console.log(k)
    var kWidth = amplitude/k //;console.log(kWidth)

    var distribution = []
    var chartXLabels = []

    chartData.sort((a,b)=>a-b)

    var j = 0
    for (i = 0; i < k; i++) { //;console.log(i + ' i ')
        var min = (i * kWidth) + lowest //;console('min ' + min)
        var max = ((i + 1) * kWidth) + lowest //;console('max ' + max)
        distribution[distribution.length] = 0
        chartXLabels[chartXLabels.length] = Math.round(min) + ' - ' + Math.round(max)
        do { //;console.log(j + ' j ')
            var value = chartData[j++] //;console.log(value)
            if (value >= min && value <= max) {
                distribution[distribution.length - 1] += 1
            }
        } while(j < chartData.length && chartData[j] >= min && chartData[j] <= max)
    }

    drawVerticalBarChart(title, chartAreaWidth, chartAreaHeight, distribution, chartXLabels)

}

function drawHistogramChartFromCSV(filePath, columnPosition, chartAreaWidth, chartAreaHeight) {

    if (typeof filePath != 'string' || filePath.trim() == '') {
        logAndAddError('Invalid file path.')
        return
    }

    if (isNaN(columnPosition) || columnPosition < 0) {
        logAndAddError('Invalid column position.')
        return
    }

    var c = Math.round(columnPosition)
    var key
    let values = []

    function parse(objc) {
        var keys = d3.keys(objc)

        if (c >= keys.length || c < 0) {
            logAndAddError('Invalid ' + c + ' value for data set ' + filePath + ' with ' + keys.length + ' columns.')
        }

        key = keys[c]
        var value = objc[key]
        var transformedValue = value.replace(',','.')
        var valueAsNumber = Number(transformedValue)
        if (!isNaN(valueAsNumber)) {
            values.push(valueAsNumber)
        }
        return objc
    }

    d3.dsv(';', filePath, null, parse).then(function(data) {
        if (data.length > 0) {
            console.log('SUCCESS: ' + data.length + ' registers were read. ' + values.length + ' numerical values for the column ' + key + '.') 
            var title = 'Histogram - ' + key + ' column values from "' + filePath + '" CSV file - ' + values.length + ' registers.'
            drawHistogramChart(chartAreaWidth, chartAreaHeight, values, title)
        } else {
            logAndAddError('Couldn\'d read the file.')
        }
    });

}