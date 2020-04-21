
/**
 * Used to draw a stacked bar chart.
 * @param {String} title 
 * @param {Number} chartAreaWidth 
 * @param {Number} chartAreaHeight 
 * @param {Array} barsLabels An array of strings containing the label of each bar; ex: [ 'A', 'B', 'C' ].
 * @param {Object} values An object containing the values to each column; ex: { 'A': [1, 2, 3], ... }.
 */
function drawMultlinesChart(title, chartAreaWidth, chartAreaHeight, lineLabels, xLabels, values, colors) {
    
    if (colors.length < lineLabels.length) {
        for (i = 230; i >= 10; i -= (255 - 10)/lineLabels.length) {
            colors.push('rgb(' + i + ', ' + i + ', ' + i + ')')
        }
    }
    
    var margin = 50

    var sizePerUnit = 0

    var maxDomainValue = 0

    lineLabels.forEach(function(lineLabel) {
        var lineValues = values[lineLabel]
        lineValues.forEach(function(lineValue) {
            if (lineValue > maxDomainValue) {
                maxDomainValue = lineValue
            }
        })
    })

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

        var xScaleDomain = []
        var yScaleDomain = []

        yScaleDomain = [0, maxDomainValue]
        xScaleDomain = [-0.5, xLabels.length - 0.5]

        var xscale = d3.scaleLinear().domain(xScaleDomain).range([0, chartAreaWidth - (2 * margin)])
        var x_axis = d3.axisBottom().scale(xscale)

        var yscale = d3.scaleLinear().domain(yScaleDomain).range([chartAreaHeight - (2 * margin), 0])
        var y_axis = d3.axisLeft().scale(yscale)

        var labelAxisTickValues = []
        for (i = 0; i < xLabels.length; i += 1) { labelAxisTickValues.push(i) } 
        x_axis
            .tickValues(labelAxisTickValues)
            .tickFormat((_,i) => xLabels[i].replace('/20','/'))

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

        var widthPerValue = availableWidth / xLabels.length
        var heightPerUnit = availableHeight / maxDomainValue

        lineLabels.forEach(function(lineLabel, j){
            var lineValue = values[lineLabel]
            for (i = 1; i < lineValue.length; i++) {
                var startValue = lineValue[i - 1]
                var endValue = lineValue[i]

                var x1 = startX + ((i - 1) * widthPerValue) + (widthPerValue * 0.5)
                var y1 = startY + (availableHeight - (startValue * heightPerUnit))

                var x2 = startX + (i * widthPerValue) + (widthPerValue * 0.5)
                var y2 = startY + (availableHeight - (endValue * heightPerUnit))

                svg.append('line')
                    .attr('x1', x1)
                    .attr('y1', y1)
                    .attr('x2', x2)
                    .attr('y2', y2)
                    .attr('stroke-width', '2')
                    .attr('stroke', colors[j])
            }
        })
        
    }

    function drawLegend() {

        var legendRowWidth = 200
        var legendRowHeight = chartAreaHeight  / lineLabels.length 
        var colorSize = legendRowHeight <= 50 ? legendRowHeight * 0.8 : 50

        var svg = chartArea.append('svg')
                                .attr('width', legendRowWidth)
                                .attr('height', lineLabels.length * legendRowHeight)

        lineLabels.forEach(function(label,i) {
            var group = svg.append('g').attr('transform', 'translate(0,' + (i * legendRowHeight) + ')')
            var color = group.append('rect')
                                .attr('x', 10)
                                .attr('y', (legendRowHeight * 0.5) - (colorSize * 0.5))
                                .attr('width', colorSize)
                                .attr('height', colorSize)
                                .attr('fill', colors[i])
                
            group.append('text')
                    .attr('x', colorSize + 20)
                    .attr('y', legendRowHeight * 0.5)
                    .text(label)
                    
        })
    }

    drawChart()
    drawAxes()
    drawLegend()

    // changing the x axis text to vertical
    d3.selectAll('.graph-x-axix .tick text')
                .attr('transform', d3Transform().rotate(-90))
                .attr('x', -27)
                .attr('y', -3)
                .attr('graph-x-axix', false)

}

function drawMultlinesChartFromCSV(filePath, width, height, colors) {

    if (typeof filePath != 'string' || filePath.trim() == '') {
        logAndAddError('Invalid file path.')
        return
    }

    var lineLabels = [ ]
    var xLabels = [ ]
    let values = { }

    function parse(object) { 

        var keys = d3.keys(object)
        
        if (lineLabels.length == 0) {
            lineLabels = keys.slice(1, keys.length)
        }

        xLabels.push(object[keys[0]])

        for (i = 1; i < keys.length; i++) {
            var key = keys[i]
            if (typeof values[key] == 'undefined') { values[key] = [ ] }
            values[key].push(object[key])
        }

        return object
    }

    d3.dsv(';', filePath, null, parse).then(function(data) {
        if (data.length > 0) {
            drawMultlinesChart('Multiple lines chart from ' + filePath , width, height, lineLabels, xLabels, values, colors)
        } else {
            logAndAddError('Couldn\'d read the file.')
        }
    });
}

