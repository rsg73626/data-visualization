
function drawCloropleth(title, data, chartAreaSize, color, minValue = null, maxValue = null, didDrawMapCompletion = null) {

    color = tryToCreateColorObjectFromValue(color)

    var chartArea = d3.select('#charts').append('article')
    chartArea.attr('id', 'chart-article')

    if (typeof title == 'string' && title.trim() != '') {
        chartArea.append('h3')
                    .text(title)
                    .style('margin', '0')
                    .style('padding', '10px')
                    .style('font-family', 'Arial')
    }

    if ((typeof didDrawMapCompletion) == 'function') {
        didDrawMapCompletion()
    }

    var svg = chartArea.append('svg')
                            .attr('width', chartAreaSize)
                            .attr('height', chartAreaSize)

    var min = minValue ?? d3.min(d3.values(data))
    var max = maxValue ?? d3.max(d3.values(data))

    var path = null
    var map = null
    var states = null

    function readTopoJSON(completion) {
        queue().defer(d3.json, './src/brazil-topojson.json').await(function(error, result) {
            if (error) {
                logAndAddError(error)
                return
            } 
            map = result
            completion()
        })
    }

    function drawMap() {

        var projection = d3.geo.mercator()
                                .center([-55,-15])
                                .scale(chartAreaSize * 1.25)
                                .translate([chartAreaSize / 2, chartAreaSize / 2]);

        path = d3.geo.path()
                        .projection(projection)

        states = topojson.feature(map, map.objects.states)
        svg.append('path')
                .datum(states)
                .attr('d', path)
                .attr('class', 'states')
                .attr('fill', 'white')
    }

    function paintMap() {

        var g = svg.append("g")
                        .attr('id', 'states-group')

        var count = 0
        g.selectAll(".estado")
            .data(states.features)
                .enter()
                    .append("path")
                    .attr("d", path)
                    .attr('id', function(feature) {
                        var BRState = BR[feature.id]
                        return BRState.uf
                    })
                    .attr('fill', function(feature) {
                        var BRState = BR[feature.id]
                        var stateValue = data[BRState.name] ?? data[BRState.uf]
                        color.a = stateValue/max
                        return rgbFromColorObject(color)
                    })

    }

    function drawLegend() {

        var legendAreaWidth = 150
        var legendAreaHeight = chartAreaSize
    
        var legendSVG = chartArea.append('svg')
                                .attr('width', legendAreaWidth)
                                .attr('height', legendAreaHeight)

            var minText = min + ''
            for (i = 0; i <= (max+'').length - minText.length; i++) { minText = '0' + minText }
            legendSVG.append('text')
                .attr('id', 'legend-min')
                .attr('x', legendAreaWidth * 0.25)
                .attr('y', legendAreaHeight * 0.85)
                .text(minText)
    
            legendSVG.append('text')
                .attr('id', 'legend-max')
                .attr('x', legendAreaWidth * 0.25)
                .attr('y', legendAreaHeight * 0.15)
                .text(max)
    
        var availableSpace = legendAreaHeight * 0.6
        var amountOfSquares = 100
        var squareHeight = availableSpace / amountOfSquares
        var squareWidth = availableSpace / 10
    
        var group = legendSVG.append('g')
                                .attr('transform', 'translate(' + ((legendAreaWidth - squareWidth) * 0.5) + ',' + (legendAreaHeight * 0.18) + ')')
    
        for (i = 0; i < amountOfSquares; i++) {
            group.append('rect')
                .attr('x', 0)
                .attr('y', (i * squareHeight))
                .attr('width', squareWidth)
                .attr('height', squareHeight)
                .attr('stroke-width', 0)
                .attr('stroke', 'none')
                .attr('fill', function(){
                    color.a = 1- (i / amountOfSquares)
                    return rgbFromColorObject(color)
                })
        }
    }

    readTopoJSON(function(){
        drawMap()
        paintMap()
        drawLegend()
    })

}

function drawCloroplethFromCSV(title, filePath, size, color) {

    var populations = {}

    function parse(objc) { 
        var statePopulationPairs = objc.map(v => d3.values(v)[0])

        statePopulationPairs.forEach(function(pair) {
            var values = pair.split(';')
            if (values.length == 2) {
                var stateName  = values[0]
                var stateValue = values[1]
    
                if ((typeof stateName) == 'string' && stateName.trim() != '' && !isNaN(stateValue)) {
                    populations[stateName.toUpperCase()] = Number(stateValue)
                }
            }
        })

        didRead()
    }

    d3.csv(filePath, parse)
    
    function didRead() {
        if (d3.keys(populations).length < 27) {
            logAndAddError('Invalid CSV file. There must be a value for each Brazil state.')
            return
        }
        
        drawCloropleth(title, populations, size, color)
    }

}