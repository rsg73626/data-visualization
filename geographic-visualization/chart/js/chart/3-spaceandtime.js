
var years = null
var populations = {}
var mapColorObject = null
var minValue = null
var maxValue = null

function yearInputDidChange() {
    var yearValue = document.getElementById('year-input').value
    d3.select('#year-label').text(yearValue)

    var yearPopulation = populations[yearValue]

    print(yearValue)
    print(yearPopulation)

    d3.keys(yearPopulation).forEach(function(state) {
        mapColorObject.a = yearPopulation[state] / maxValue
        d3.selectAll('#' + BRUFForState[state])
            .attr('fill', rgbFromColorObject(mapColorObject))
    })

}

function drawSpaceAndTimeVisualization(title, chartAreaSize, color) {

    mapColorObject = tryToCreateColorObjectFromValue(color)

    var allValues = []
    d3.values(populations).map(v=>d3.values(v)).forEach(v=> allValues = allValues.concat(v))
    
    minValue = d3.min(allValues)
    maxValue = d3.max(allValues)

    function drawSlider() {

        var chartArea = d3.select('#chart-article')

       var select = chartArea.append('select')
                                .attr('id', 'year-input')
                                .attr('onchange', 'javascript:yearInputDidChange()')
                                .attr('style', 'height: 44px; margin-top: 30px; margin-left: 100px;')

        select.append('option').attr('value', 1995).attr('selcted', true).text(1995)
        select.append('option').attr('value', 2014).attr('selcted', true).text(2014)
        select.append('option').attr('value', 2015).attr('selcted', true).text(2015)
        select.append('option').attr('value', 2016).attr('selcted', true).text(2016)
        select.append('option').attr('value', 2017).attr('selcted', true).text(2017)
        select.append('option').attr('value', 2018).attr('selcted', true).text(2018)
        select.append('option').attr('value', 2019).attr('selcted', true).text(2019)

    }

    drawCloropleth(title, populations[years[0]], chartAreaSize, color, minValue, maxValue, drawSlider)

}

function drawSpaceAndTimeVisualizationFromCSV(title, filePath, size, color) {

    function parse(table) { 

        for (i = 0; i < table.length; i++) {
            var row = table[i]
            if (i == 0) {
                years = d3.keys(row)[0].split(';')
                years.splice(0,1)
                years = years.map(v=>Number(v))
                years.forEach(function(year){populations[year]={}})
            }

            var values = d3.values(row)[0].split(';')
            var state = values[0].toUpperCase()
            values.splice(0,1)
            var yearsValues = values.map(v=>Number(v))

            if (years.length == yearsValues.length) {

                for (j = 0; j < years.length; j++) {
                    var year = years[j]
                    var yearValue = yearsValues[j]
                    populations[year][state] = yearValue
                }

            }
            
        }
        
        didRead()
    }

    d3.csv(filePath, parse)

    function didRead() {

        if (d3.keys(populations[years[0]]).length < 27) {
            logAndAddError('Invalid CSV file. There must be a value for each Brazil state.')
            return
        }

        drawSpaceAndTimeVisualization(title, size, color)

    }

}