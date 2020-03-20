
function drawVerticalBarChart(chartAreaWidth, chartAreaHeight, chartData, chartXLabels = []) {

    var margin = 50

    var barWidth = 0

    var heightPerUnit = 0

    var svg = d3.select('body')
                    .append('svg')
                        .attr('width', chartAreaWidth)
                        .attr('height', chartAreaHeight)

    function drawAxix() {

        var xscale = d3.scaleLinear()
                        .domain([-0.5, chartData.length - 0.5])
                        .range([0, chartAreaWidth - (2 * margin)])

        var yscale = d3.scaleLinear()
                        .domain([0, d3.max(chartData)])
                        .range([chartAreaHeight - (2 * margin), 0])

        var tickValues = []
        for (i = 0; i < chartData.length; i += 1) { tickValues[tickValues.length] = i }
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
    drawAxix()

    // changing the value text to vertical
    d3.selectAll('.graph-text-value')
                .attr('transform', d3Transform().rotate(-90))
                .attr('x', function(d) { return (d * heightPerUnit) - chartAreaHeight + (margin * 2) } )
                .attr('y', barWidth * (barWidth <= 40 ? 1 : 0.75))
                .classed('graph-text-value', false)

    // changing the x axis text to vertical
    d3.selectAll('.graph-x-axix .tick text')
                .attr('transform', d3Transform().rotate(-90))
                .attr('x', -25)
                .attr('y', -3)
                .attr('graph-x-axix', false)

}

function drawHistogramChart(chartAreaWidth, chartAreaHeight, chartData) {
    if (!Array.isArray(chartData) || chartData.length == 0) {
        console.error('ERROR: Invalid chart data. It has to be an array with numerical values.')
        d3.select('body')
                    .append('h3')
                        .classed('error', true)
                        .text('ERROR: Invalid chart data. It has to be an array with numerical values.')
                        .style('margin', '0')
                        .style('padding', '0')
                        .style('font-family', 'Arial')
                        .style('color', 'red')
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

    drawVerticalBarChart(chartAreaWidth, chartAreaHeight, distribution, chartXLabels)

}

function drawHistogramChartFromCSV(filePath, columnPosition, chartAreaWidth, chartAreaHeight) {

    if (typeof filePath != 'string' || filePath.trim() == '') {
        console.error('ERROR: Invalid file path.')
        d3.select('body')
                    .append('h3')
                        .classed('error', true)
                        .text('ERROR: Invalid file path.')
                        .style('margin', '0')
                        .style('padding', '0')
                        .style('font-family', 'Arial')
                        .style('color', 'red')
        return
    }

    if (isNaN(columnPosition) || columnPosition < 0) {
        console.error('ERROR: Invalid column position.')
        d3.select('body')
                    .append('h3')
                        .classed('error', true)
                        .text('ERROR: Invalid column position.')
                        .style('margin', '0')
                        .style('padding', '0')
                        .style('font-family', 'Arial')
                        .style('color', 'red')
        return
    }

    var c = Math.round(columnPosition)
    var key
    let values = []

    function parse(objc) {
        var keys = d3.keys(objc)

        if (c >= keys.length) {
            console.error('ERROR: invalid ' + c + ' value for data set ' + filePath + ' with ' + keys.length + ' columns.')
            d3.select('body')
                    .append('h3')
                        .classed('error', true)
                        .text('ERROR: invalid ' + c + ' value for data set ' + filePath + ' with ' + keys.length + 'columns.')
                        .style('margin', '0')
                        .style('padding', '0')
                        .style('font-family', 'Arial')
                        .style('color', 'red')
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
            d3.select('body')
                    .append('h3')
                        .text('Histogram - ' + key + ' column values from "' + filePath + '" CSV file - ' + values.length + ' registers.')
                        .style('margin', '0')
                        .style('padding', '0')
                        .style('font-family', 'Arial')
            drawHistogramChart(chartAreaWidth, chartAreaHeight, values)
        } else {
            console.error('ERROR: Couldn\'d read the file.')
            d3.select('body')
                    .append('h3')
                        .classed('error', true)
                        .text('ERROR: Couldn\'d read the file.')
                        .style('margin', '0')
                        .style('padding', '0')
                        .style('font-family', 'Arial')
                        .style('color', 'red')
        }
    });

}