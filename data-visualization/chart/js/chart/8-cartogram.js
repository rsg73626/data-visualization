
function didReadJson(jsonObject) { //print(jsonObject); print(jsonObject.objects)

    var chartAreaWidth = 500
    var chartAreaHeight = 500
    var chartArea = d3.select('#charts').append('article')

    var svg = chartArea.append('svg')
                            .attr('width', chartAreaWidth)
                            .attr('height', chartAreaHeight)

    var objects = jsonObject.objects;print(objects)

}

var filePath = './src/brazil-states/35.json'

d3.json(filePath).then(didReadJson)