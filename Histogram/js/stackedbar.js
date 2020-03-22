
// Vertical or horizontal 
// Bar labels
// Bar sections labels
// Bar sections values
// Type: common or one hundred per cent 

var COMMON = 'common_stackedbar_chart'
var PERCENTAGE = 'percentage_stackedbar_chart'

var HORIZONTAL = 'horizontal_stackedbar_chart'
var VERTICAL = 'vertical_stackedbar_chart'

/**
 * Used to draw a stacked bar chart.
 * @param {String} title 
 * @param {String} type COMMON or PERCENTAGE.
 * @param {Number} chartAreaWidth 
 * @param {Number} chartAreaHeight 
 * @param {String} orientation HORIZONTAL or VERTICAL.
 * @param {Array} barsLabels An array of strings containing the label of each bar; ex: [ 'A', 'B', 'C' ].
 * @param {Array} barSectionsLabels An array of strings containing the label of each bar section; ex: [ 'Category A', 'Category B', 'Category C' ].
 * @param {Object} values An object containing the values to each column; ex: { 'A': { 'Category A': 5, 'Category B': 10, 'Category C': 15 }, ... }; it must contains an object to each bar label value, and each of these objects must contain a value to each bar section label.
 */
function drawStackedbarChart(title, type, chartAreaWidth, chartAreaHeight, orientation, barsLabels, barSectionsLabels, values, colors) {

    // Adding the totalValue parameter to each column object

    barsLabels.forEach(function(barLabel) {
        var total = 0
        var columnObject = values[barLabel]
        barSectionsLabels.forEach(label => total += columnObject[label])
        columnObject.totalValue = total
    })

    var max = 0
    var firstColumnObject = values[barsLabels[0]]
    barSectionsLabels.forEach(label => max += firstColumnObject[label])

    var maxColumnValue = (function() {
        var max = values[barsLabels[0]].totalValue
        for (i = 1; i < barsLabels.length; i++) {
            if (values[barsLabels[i]].totalValue > max) { max = values[barsLabels[i]].totalValue }
        }
        return max
    })()
    print(colors)
    if (colors.length < barSectionsLabels.length) {
        for (i = 230; i >= 10; i -= (255 - 10)/barSectionsLabels.length) {
            colors.push('rgb(' + i + ', ' + i + ', ' + i + ')')
        }
    }

    var margin = 50

    var barThickness = 0

    var sizePerUnit = 0

    var maxDomainValue = type == COMMON ? maxColumnValue : 100

    if (typeof title == 'string' && title.trim() != '') {
        d3.select('body').append('h3')
                            .text(title)
                            .style('margin', '0')
                            .style('padding', '0')
                            .style('font-family', 'Arial')
    }

    var svg = d3.select('body')
                    .append('svg')
                        .attr('width', chartAreaWidth)
                        .attr('height', chartAreaHeight)

    function drawAxes() {

        var xScaleDomain = []
        var yScaleDomain = []

        /*
            Horizontal
            X: values (0-max) | (0-100%)
            Y: labels

            Vertical
            X: labels
            Y: values (0-max) | (0-100%)
        */

        if (orientation == HORIZONTAL) {
            yScaleDomain = [-0.5, barsLabels.length - 0.5]
            xScaleDomain = [0, maxDomainValue]
        } else {
            xScaleDomain = [-0.5, barsLabels.length - 0.5]
            yScaleDomain = [0, maxDomainValue]
        }

        var xscale = d3.scaleLinear().domain(xScaleDomain).range([0, chartAreaWidth - (2 * margin)])
        var x_axis = d3.axisBottom().scale(xscale)

        var yscale = d3.scaleLinear().domain(yScaleDomain).range([chartAreaHeight - (2 * margin), 0])
        var y_axis = d3.axisLeft().scale(yscale)

        var labelAxisTickValues = []
        for (i = 0; i < barsLabels.length; i += 1) { labelAxisTickValues.push(i) } 
        (orientation == HORIZONTAL ? y_axis : x_axis)
            .tickValues(labelAxisTickValues)
            .tickFormat(value => barsLabels[value])

        if (type == PERCENTAGE) {
            var valueAxisTickValues = []
            for (i = 0; i <= 100; i += 10) { valueAxisTickValues.push(i) }
            (orientation == HORIZONTAL ? x_axis : y_axis)
                .tickValues(valueAxisTickValues)
                .tickFormat(value => value + '%')
        }

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

        var availableSpacePerBar = (orientation == HORIZONTAL) ? (availableHeight / barsLabels.length) : (availableWidth / barsLabels.length)
        barThickness = availableSpacePerBar * 0.9

        sizePerUnit = orientation == HORIZONTAL ? availableWidth / maxDomainValue : availableHeight/maxDomainValue

        var bar = svg.selectAll('g') 
                    .data(barsLabels)
                    .enter()
                        .append('g')
                            .attr('transform',  function(d, i) {
                                var x = 0
                                var y = 0
                                if (orientation == HORIZONTAL) {
                                    x = startX
                                    y = availableHeight - (availableSpacePerBar * (i+1)) + margin
                                } else {
                                    x = startX + (availableSpacePerBar * i)
                                    y = startY
                                }
                                return 'translate(' + x + ',' + y + ')'
                            })
        
        barsLabels.forEach(function(label, i) { 
            var column = values[label]

            if (type == PERCENTAGE) {
                sizePerUnit = orientation == HORIZONTAL ? availableWidth / column.totalValue : availableHeight / column.totalValue
            }

            var lastColumnEnd = orientation == HORIZONTAL ? 0 : availableHeight
            
            barSectionsLabels.forEach(function(section, j) { 
                var value = column[section] 
                
                bar.filter(v=>v==label).append('rect')
                        .attr('x', function(d) { 
                            if (orientation == HORIZONTAL) {
                                var currentX = lastColumnEnd
                                lastColumnEnd = currentX + (value * sizePerUnit)
                                return currentX
                            } else {
                                return (availableSpacePerBar / 2) - (barThickness / 2)
                            }
                        })
                        .attr('y', function() {
                            if (orientation == HORIZONTAL) {
                                return (availableSpacePerBar / 2) - (barThickness / 2)
                            } else {
                                var currentY = lastColumnEnd - (value * sizePerUnit)
                                lastColumnEnd = currentY
                                return currentY
                            }
                        })
                        .attr('width', orientation == HORIZONTAL ? (value * sizePerUnit) : barThickness)
                        .attr('height', orientation == HORIZONTAL ? barThickness: (value * sizePerUnit))
                        .attr('fill', colors[j])

            })
        })
        
    }

    function drawLegend() {

        var legendRowWidth = 200
        var legendRowHeight = chartAreaHeight  / barSectionsLabels.length 
        var colorSize = legendRowHeight <= 50 ? legendRowHeight * 0.8 : 50

        var svg = d3.select('body')
                    .append('svg')
                        .attr('width', legendRowWidth)
                        .attr('height', barSectionsLabels.length * legendRowHeight)

        barSectionsLabels.forEach(function(label,i) {
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

}

function drawStackedbarChartFromCSV(filePath, type, width, height, orientation, colors) {

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
            drawStackedbarChart('Stacked bar chart from ' + filePath, type, width, height, orientation, barsLabels, barSectionsLabels, values, colors)
        } else {
            logAndAddError('Couldn\'d read the file.')
        }
    });
}

