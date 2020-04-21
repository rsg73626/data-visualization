

var HORIZONTAL = 'horizontal_stackedbar_chart'
var VERTICAL = 'vertical_stackedbar_chart'

/**
 * Used to draw a stacked bar chart.
 * @param {String} title 
 * @param {Number} chartAreaSize 
 * @param {Array} valueLabels An array of strings containing the label of each bar; ex: [ 'A', 'B', 'C' ].
 * @param {Array} sectionLabels An array of strings containing the label of each bar section; ex: [ 'Category A', 'Category B', 'Category C' ].
 * @param {Object} values An object containing the values to each column; ex: { 'A': { 'Category A': 5, 'Category B': 10, 'Category C': 15 }, ... }.
 */
function drawRadarChart(title, chartAreaSize, valueLabels, sectionLabels, values, colors) {

    if (colors.length < valueLabels.length) {
        for (i = 230; i >= 10; i -= ((230 - 10)/valueLabels.length)) {
            colors.push('rgb(' + i + ', ' + i + ', ' + i + ')')
        }
    }

    var chartArea = d3.select('#charts').append('article')

    if (typeof title == 'string' && title.trim() != '') {
        chartArea.append('h3')
                    .text(title)
                    .style('margin', '0')
                    .style('padding', '10px')
                    .style('font-family', 'Arial')
    }

    var svg = chartArea.append('svg')
                            .attr('width', chartAreaSize)
                            .attr('height', chartAreaSize)

    var maxValue = (function() {
        var max = d3.max(d3.values(values[valueLabels[0]]))
        for (i = 0; i < valueLabels.length; i++) {
            var aux = d3.max(d3.values(values[valueLabels[i]]))
            if (aux > max) { max = aux }
        }
        return max
    })()

    var margin = 60
    var availableSize = chartAreaSize - (2 * margin)

    var c = availableSize * 0.5 
    var n = sectionLabels.length
    var sector = -360 / n 
    var x0 = chartAreaSize / 2 
    var y0 = x0 

    function drawAxes() {
        
        for (i = 1; i <= n; i++) {
            var coordinate = getCoordenate(x0, y0, c, (sector * i))
            var x1 = coordinate.x
            var y1 = coordinate.y
    
            svg.append('line')
                    .attr('x1', x0)
                    .attr('y1', y0)
                    .attr('x2', x1)
                    .attr('y2', y1)
                    .attr('stroke-dasharray', '8,8')
                    .attr('stroke', 'gray')
        }
    
        svg.append('circle')
                .attr('cx', x0)
                .attr('cy', y0)
                .attr('r', c)
                .attr('fill', 'none')
                .attr('stroke', 'gray')
                .attr('stroke-width', '1')
    
        for (i = 0.2; i < 1; i += 0.2) {
            svg.append('circle')
                .attr('cx', x0)
                .attr('cy', y0)
                .attr('r', c * i)
                .attr('fill', 'none')
                .attr('stroke', 'gray')
                .attr('stroke-width', '1')
                .attr('stroke-dasharray', '8,8')
        }
    }

    function drawChart() {

        for (j = 0; j < valueLabels.length; j++) {
            var valueLabel = valueLabels[j] //; print('Value label: ' + valueLabel)
            var color = colors[j] //; print('Color: ' + color)

            var register = values[valueLabel]
            var registerCoordinates = [ ]
            var registerNumericalValues = d3.values(register)
            for (i = 0; i < registerNumericalValues.length; i++) {
                var coordinate = getCoordenate(x0, y0, c * (registerNumericalValues[i] / maxValue), sector * i)
                svg.append('circle')
                        .attr('cx', coordinate.x)
                        .attr('cy', coordinate.y)
                        .attr('r', 5)
                        .attr('fill', color)
                registerCoordinates.push(coordinate)
            }
            for (i = 1; i < registerCoordinates.length; i++) {
                svg.append('line')
                        .attr('x1', registerCoordinates[i-1].x)
                        .attr('y1', registerCoordinates[i-1].y)
                        .attr('x2', registerCoordinates[i].x)
                        .attr('y2', registerCoordinates[i].y)
                        .attr('stroke-width', 3)
                        .attr('stroke', color)
            }
            svg.append('line')
                        .attr('x1', registerCoordinates[registerCoordinates.length-1].x)
                        .attr('y1', registerCoordinates[registerCoordinates.length-1].y)
                        .attr('x2', registerCoordinates[0].x)
                        .attr('y2', registerCoordinates[0].y)
                        .attr('stroke-width', 3)
                        .attr('stroke', color)
        }

    }

    function drawLegend() {

        var legendRowWidth = 200
        var legendRowHeight = chartAreaSize  / valueLabels.length 
        var colorSize = legendRowHeight <= 50 ? legendRowHeight * 0.8 : 50

        var svg = chartArea.append('svg')
                                .attr('width', legendRowWidth)
                                .attr('height', valueLabels.length * legendRowHeight)

        valueLabels.forEach(function(label,i) {
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

    function drawLabels() {
        for (i = 0.2; i <= 1; i += 0.2) {
            svg.append('text')
                    .attr('x', x0)
                    .attr('y', y0 - (c * i) + 15)
                    .text(Math.round(maxValue * i))
        }

        for (i = 1; i <= n; i++) {
            var coordinate = getCoordenate(x0, y0, c + (0.5 * margin), (sector * i))
            var x1 = coordinate.x
            var y1 = coordinate.y
            
            var text = svg.append('text')
                    .attr('x', x1)
                    .attr('y', y1)
                    .text(sectionLabels[i-1])
                    .attr('transform', 'translate(-30,0)')

            if (i == n) {
                text.attr('transform', 'translate(-70,0)')
            }
        }
    }

    drawAxes()
    drawChart()
    drawLegend()
    drawLabels()

}

function drawRadarChartFromFile(filePath, size, colors) {

    if (typeof filePath != 'string' || filePath.trim() == '') {
        logAndAddError('Invalid file path.')
        return
    }

    // title, 
    // type, 
    // chartAreaWidth, 
    // chartAreaHeight, 
    // orientation, 
    // barsLabels, 
    // barSectionsLabels, 
    // values

    var barsLabels = [ ]
    var barSectionsLabels = [ ]
    let values = { }

    function parse(objc) {
        var keys = d3.keys(objc)
        var vs = d3.values(objc)

        if (barSectionsLabels.length == 0) {
            barSectionsLabels = keys.filter(key => key != keys[0])
        }

        barsLabels.push(vs[0])
        values[vs[0]] = { }
        for (i = 1; i < keys.length; i++) {
            var v = vs[i]
            let vAsNumber = Number(v)
            if (!isNaN(vAsNumber)) {
                values[vs[0]][keys[i]] = vAsNumber
            } else {
                return 
            }
        }

        return objc
    }

    d3.dsv(';', filePath, null, parse).then(function(data) {
        if (data.length > 0) {
            drawRadarChart('Radar chart from ' + filePath, size, barsLabels, barSectionsLabels, values, colors)
        } else {
            logAndAddError('Couldn\'d read the file.')
        }
    });

}

