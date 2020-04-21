
var chartAreaWidth = 500
var chartAreaHeight = 500
var chartArea = null
var svg = null

function rgb(alphaRate) {
    var minAlpha = 0.0
    var maxAlpha = 1
    var alphaValue = minAlpha + ((maxAlpha - minAlpha) * alphaRate)
    return 'rgba(150, 10, 50, ' + alphaValue + ')'
}

function drawMap() {

    chartArea = d3.select('#charts').append('article')

    chartArea.append('h3')
                    .text('IBGE: População estimada do Brasil.')
                    .style('margin', '0')
                    .style('padding', '10px')
                    .style('font-family', 'Arial')

    svg = chartArea.append('svg')
        .attr('width', chartAreaWidth)
        .attr('height', chartAreaHeight)

    var g = svg.append("g")

    // Align center of Brazil to center of map
    var projection = d3.geo.mercator()
                                .scale(650)
                                .center([-52, -15])
                                .translate([chartAreaWidth * 0.5, chartAreaHeight * 0.5]);

    var path = d3.geo.path().projection(projection);

    function didReadBrazilStatesTopoJSONFile(error, shp) {
        if (error) throw error;

        // Extracting polygons and contours
        var states = topojson.feature(shp, shp.objects.estados);
        var states_contour = topojson.mesh(shp, shp.objects.estados);
        
        // Desenhando estados
        g.selectAll(".estado")
            .data(states.features)
                .enter()
                    .append("path")
                    .attr("class", "state")
                    .attr("d", path)
                    .attr('fill', 'lightgray')
                    .attr('id', (data => data.id))

        g.append("path")
            .datum(states_contour)
            .attr("d", path)
            .attr("class", "state_contour")

        updateChart(currentYear)
    }

    d3.select(self.frameElement).style("height", chartAreaHeight + "px");

    d3_queue.queue()
        .defer(d3.json, "./src/br-states.json")
        .await(didReadBrazilStatesTopoJSONFile)

}

function drawLegend() {

    var legendAreaWidth = 150
    var legendAreaHeight = chartAreaHeight

    var legendSVG = chartArea.append('svg')
                            .attr('width', legendAreaWidth)
                            .attr('height', chartAreaHeight)

        legendSVG.append('text')
            .attr('id', 'legend-min')
            .attr('x', legendAreaWidth * 0.25)
            .attr('y', legendAreaHeight * 0.85)

        legendSVG.append('text')
            .attr('id', 'legend-max')
            .attr('x', legendAreaWidth * 0.25)
            .attr('y', legendAreaHeight * 0.15)

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
            .attr('fill', rgb(1 - (i/amountOfSquares)))
    }
}

function updateCloropleth(data, max) {
    d3.selectAll('.state').attr('fill', (objc => rgb(data[objc.id] / max)))
}

function updateLegend(min, max) {

    var minText = min + ''
    for (i = 0; i <= (max+'').length - minText.length; i++) { minText = '0' + minText }
    d3.select('#legend-min').text(minText)
    d3.select('#legend-max').text(max)
}

var populationData = {
    '2018': { 
        AC: 100,
        AL: 200,
        AP: 300,
        AM: 400,
        BA: 500,
        CE: 600,
        DF: 700,
        ES: 800,
        GO: 900,
        MA: 1000,
        MT: 1100,
        MS: 1200,
        MG: 1300,
        PA: 1400,
        PB: 1500,
        PR: 1600,
        PE: 1700,
        PI: 1800,
        RJ: 1900,
        RN: 2000,
        RS: 2100,
        RO: 2200,
        RR: 2300,
        SC: 2400,
        SP: 2500,
        SE: 2600,
        TO: 2700 
    },
    '2019': { 
            AC: 881935,
            AL: 3337357,
            AP: 845731,
            AM: 4144597,
            BA: 14873064,
            CE: 9132078,
            DF: 3015268,
            ES: 4018650,
            GO: 7018354,
            MA: 7075181,
            MT: 3484466,
            MS: 2778986,
            MG: 21168791,
            PA: 8602865,
            PB: 4018127,
            PR: 11433957,
            PE: 9557071,
            PI: 3273227,
            RJ: 17264943,
            RN: 3506853,
            RS: 11377239,
            RO: 1777225,
            RR: 605761,
            SC: 7164788,
            SP: 45919049,
            SE: 2298696,
            TO: 1572866 
        }
}

function updateChart(year) {
    var populations = populationData[year]
    if ((typeof populations) != 'undefined') {
        var maxPopulation = d3.max(d3.values(populations))
        var minPopulation = d3.min(d3.values(populations))
        updateCloropleth(populations, maxPopulation)
        updateLegend(minPopulation, maxPopulation)
    }
}



            

            