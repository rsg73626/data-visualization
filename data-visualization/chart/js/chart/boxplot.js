

var HORIZONTAL = 'horizontal_stackedbar_chart'
var VERTICAL = 'vertical_stackedbar_chart'

/**
 * Used to draw a stacked bar chart.
 * @param {String} title 
 * @param {Number} chartAreaWidth 
 * @param {Number} chartAreaHeight 
 * @param {String} orientation HORIZONTAL or VERTICAL.
 * @param {Object} boxes An object containing the numerical values to each column; ex: { 'First Column Label': { 'values': [1,2,3,4,5,6,7], 'q1': 2, 'q2': 4, 'q3': 6 , 'min': 1, 'max': 7}, ... };
 */
function drawBoxplotChart(title, chartAreaWidth, chartAreaHeight, orientation, boxes) {

    var labels = d3.keys(boxes)

    var maxChartValue = (function(){
        var aux = boxes[labels[0]].max
        for (i = 1; i < labels.length; i++) {
            if (boxes[labels[i]].max > aux) { aux = boxes[labels[i]].max }
        }
        return aux
    })()

    var margin = 50

    var barThickness = 0

    var sizePerUnit = 0

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

        /*
            Horizontal
            X: values (0-max)
            Y: labels

            Vertical
            X: labels
            Y: values (0-max)
        */

        yScaleDomain = orientation == HORIZONTAL ? [-0.5, labels.length - 0.5] : [0, maxChartValue]
        xScaleDomain = orientation == HORIZONTAL ? [0, maxChartValue] : [-0.5, labels.length - 0.5]

        var xscale = d3.scaleLinear().domain(xScaleDomain).range([0, chartAreaWidth - (2 * margin)])
        var x_axis = d3.axisBottom().scale(xscale)

        var yscale = d3.scaleLinear().domain(yScaleDomain).range([chartAreaHeight - (2 * margin), 0])
        var y_axis = d3.axisLeft().scale(yscale)

        var labelAxisTickValues = []
        for (i = 0; i < labels.length; i += 1) { labelAxisTickValues.push(i) } 
        (orientation == HORIZONTAL ? y_axis : x_axis)
            .tickValues(labelAxisTickValues)
            .tickFormat(value => labels[value])

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

        var availableSpacePerBar = (orientation == HORIZONTAL) ? (availableHeight / labels.length) : (availableWidth / labels.length)
        barThickness = availableSpacePerBar * 0.9

        sizePerUnit = orientation == HORIZONTAL ? availableWidth / maxChartValue : availableHeight / maxChartValue

        var bar = svg.selectAll('g') 
                    .data(d3.values(boxes))
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
        
        // Q1 -> Q2
        bar.append('rect')
                .attr('stroke', 'gray')
                .attr('stroke-width', '2')
                .attr('x', function(box, i) {
                    if (orientation == HORIZONTAL ){
                        return box.q1 * sizePerUnit
                    } else {
                        return (availableSpacePerBar - barThickness) * 0.5
                    }
                })
                .attr('y', function(box, i) { 
                    if (orientation == HORIZONTAL) {
                        return (availableSpacePerBar - barThickness) * 0.5
                    } else { 
                        return availableHeight - (box.q2 * sizePerUnit)
                    }
                })
                .attr('width', function(box, i) {
                    if (orientation == HORIZONTAL ) {
                        return ((box.q2 - box.q1) * sizePerUnit)
                    } else {
                        return barThickness
                    }
                })
                .attr('height', function(box,i) {
                    if (orientation == HORIZONTAL) {
                        return barThickness
                    } else {
                        return ((box.q2 - box.q1) * sizePerUnit)
                    }
                })
                .attr('fill','lightgray')

        // Q2 -> Q3
        bar.append('rect')
                .attr('stroke', 'gray')
                .attr('stroke-width', '2')
                .attr('x', function(box, i) {
                    if (orientation == HORIZONTAL ){
                        return box.q2 * sizePerUnit
                    } else {
                        return (availableSpacePerBar - barThickness) * 0.5
                    }
                })
                .attr('y', function(box, i) { 
                    if (orientation == HORIZONTAL) {
                        return (availableSpacePerBar - barThickness) * 0.5
                    } else {
                        return availableHeight - (box.q3 * sizePerUnit)
                    }
                })
                .attr('width', function(box, i) {
                    if (orientation == HORIZONTAL ) {
                        return ((box.q3 - box.q2) * sizePerUnit)
                    } else {
                        return barThickness
                    }
                })
                .attr('height', function(box,i) {
                    if (orientation == HORIZONTAL) {
                        return barThickness
                    } else {
                        return ((box.q3 - box.q2) * sizePerUnit)
                    }
                })
                .attr('fill','lightgray')

        // Min value

        bar.append('line')
                .style('stroke', 'gray')
                .style('stroke-width', '2')
                .attr('x1', (box => orientation == HORIZONTAL ? box.min * sizePerUnit : availableSpacePerBar * 0.3 ))
                .attr('x2', (box => orientation == HORIZONTAL ? box.min * sizePerUnit : availableSpacePerBar* 0.7))
                .attr('y1', (box => orientation == HORIZONTAL ? availableSpacePerBar * 0.3 : availableHeight - (box.min * sizePerUnit)))
                .attr('y2', (box => orientation == HORIZONTAL ? availableSpacePerBar* 0.7 : availableHeight - (box.min * sizePerUnit)))

        bar.append('line')
            .style('stroke', 'gray')
            .style('stroke-width', '2')
            .attr('x1', (box => orientation == HORIZONTAL ? box.min * sizePerUnit : availableSpacePerBar * 0.5 ))
            .attr('x2', (box => orientation == HORIZONTAL ? box.q1 * sizePerUnit : availableSpacePerBar* 0.5))
            .attr('y1', (box => orientation == HORIZONTAL ? availableSpacePerBar * 0.5 : availableHeight - (box.min * sizePerUnit)))
            .attr('y2', (box => orientation == HORIZONTAL ? availableSpacePerBar* 0.5 : availableHeight - (box.q1 * sizePerUnit)))

        // Max value
        
        bar.append('line')
            .style('stroke', 'gray')
            .style('stroke-width', '2')
            .attr('x1', (box => orientation == HORIZONTAL ? box.max * sizePerUnit : availableSpacePerBar * 0.3 ))
            .attr('x2', (box => orientation == HORIZONTAL ? box.max * sizePerUnit : availableSpacePerBar* 0.7))
            .attr('y1', (box => orientation == HORIZONTAL ? availableSpacePerBar * 0.3 : availableHeight - (box.max * sizePerUnit)))
            .attr('y2', (box => orientation == HORIZONTAL ? availableSpacePerBar* 0.7 : availableHeight - (box.max * sizePerUnit)))

        bar.append('line')
            .style('stroke', 'gray')
            .style('stroke-width', '2')
            .attr('x1', (box => orientation == HORIZONTAL ? box.q3 * sizePerUnit : availableSpacePerBar * 0.5 ))
            .attr('x2', (box => orientation == HORIZONTAL ? box.max * sizePerUnit : availableSpacePerBar* 0.5))
            .attr('y1', (box => orientation == HORIZONTAL ? availableSpacePerBar * 0.5 : availableHeight - (box.q3 * sizePerUnit)))
            .attr('y2', (box => orientation == HORIZONTAL ? availableSpacePerBar* 0.5 : availableHeight - (box.max * sizePerUnit)))

    }
    
    drawChart()
    drawAxes()

}

function drawBoxplotChartFromCSV(filePath, columns, orientation, width, height) {

    if (typeof filePath != 'string' || filePath.trim() == '') {
        logAndAddError('Invalid file path.')
        return
    }

    var boxes = { }
    var validKeys = []
    var isFirstParse = true

    function parse(object) {

        if (isFirstParse) {
            var keys = d3.keys(object)
            for (i = 0; i < columns.length; i++) {
                var column = columns[i]
                if (column < 0 || column >= keys.length) {
                    logAndAddError('Invalid column value ' + column + '. \nThe column positions must be numerical values from 0 to number of table columns minus 1. For example: 0;1;2.')
                    columns.splice(i, 1)
                    i -= 1
                    continue
                } else {
                    var key = keys[column]
                    var value = Number(d3.values(object)[column])
                    if (isNaN(value)) {
                        logAndAddError('Invalid column value ' + column + '. \nThe column must contains only numerical values.')
                        columns.splice(i, 1)
                        i -= 1
                        continue
                    } 
                }
                validKeys.push(key)
            }
        }
        
        validKeys.forEach(function(key) {
            var value = object[key]
            var valueAsNumber = Number(value)
            if (!isNaN(valueAsNumber)) {
                if ((typeof boxes[key]) != 'undefined') {
                    boxes[key].values.push(valueAsNumber)
                    if (valueAsNumber < boxes[key].min) { boxes[key].min = valueAsNumber }
                    if (valueAsNumber > boxes[key].max) { boxes[key].max = valueAsNumber }
                } else {
                    boxes[key] = { 
                        values: [ valueAsNumber ],
                        min: valueAsNumber,
                        max: valueAsNumber
                    }
                }
            }
        })

        if (isFirstParse) {
            isFirstParse = false
        }

        return object
    }

    function filterBoxes() {
        var newBoxes = { }
        d3.keys(boxes).forEach(function(key) {
            if (boxes[key].min >= 0) {
                newBoxes[key] = boxes[key]
                newBoxes[key].values = newBoxes[key].values.sort()
            } else {
                logAndAddError('The column ' + key + ' has negative values. \nThis implementation does not support negative values yet.')
            }
        })
        boxes = newBoxes
    }

    function defineQuartiles() {

        function q1(values) {
            if ((values.length % 2) == 0) {
                var i = parseInt(values.length / 4) - 1
                return (values[i] + values[i + 1]) / 2
            } else {
                var q1Size = ((values.length - 1) / 2)
                if ((q1Size % 2) == 0) {
                    var i = (q1Size / 2) - 1
                    return (values[i] + values[i + 1]) / 2
                } else {
                    return values[parseInt(q1Size / 2)]
                }
            }
        }

        function q2(values) {
            var q2Size = values.length
            if ((q2Size % 2) == 0) {
                var i = (q2Size / 2) - 1
                return (values[i] + values[i + 1]) / 2
            } else {
                return values[parseInt(q2Size / 2)]
            }
        }

        function q3(values) {
            if ((values.length % 2) == 0) {
                var i = values.length - parseInt(values.length / 4) - 1
                return (values[i] + values[i + 1]) / 2
            } else {
                var q3Size = ((values.length - 1) / 2)
                if ((q3Size % 2) == 0) {
                    var i = values.length - (q3Size / 2) - 1
                    return (values[i] + values[i + 1]) / 2
                } else {
                    return values[parseInt(values.length - (q3Size / 2))]
                }
            }
        }

        d3.keys(boxes).forEach(function(key) {
            var box = boxes[key]
            var values = box.values
            box.q1 = q1(values)
            box.q2 = q2(values)
            box.q3 = q3(values)
        })
    }

    d3.dsv(';', filePath, null, parse).then(function(data) {
        if (data.length > 0) {
            if (d3.keys(boxes).length > 0) {
                filterBoxes()
                defineQuartiles()
                if (d3.keys(boxes).length == 0) {
                    logAndAddError('No valid columns to plot. The columns must contain only positve numerical values (it does not support negative values yet).')
                } else {
                    drawBoxplotChart('Box plot chart from ' + filePath, width, height, orientation, boxes)
                }
            } else {
                logAndAddError('No valid columns to plot.')
            }
        } else {
            logAndAddError('Couldn\'d read the file.')
        }
    });

}


