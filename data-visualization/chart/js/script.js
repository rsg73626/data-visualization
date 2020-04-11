
function print(content) {
    console.log(content)
}

function logError(content) {
    console.error('ERROR: ' + content)
}

function addError(content) {
    d3.select('#charts').append('h3')
                        .classed('error', true)
                        .text('ERROR: ' + content + '\n')
                        .style('margin', '0')
                        .style('padding', '0')
                        .style('font-family', 'Arial')
                        .style('color', 'red')
}

function logAndAddError(content) {
    logError(content)
    addError(content)
}

function clearErrors() {
    d3.selectAll('.error').remove()
}

function toRadians(value) {
    return (value * Math.PI) / 180
}

function toDegrees(value) {
    return (value * 180) / Math.PI
}

function getCoordenate(x0, y0, length, angle) {
    var sinAlpha = Math.sin(toRadians(angle))
    var cosAlpha = Math.cos(toRadians(angle))
    var x1 = (length * cosAlpha) + x0
    var y1 = (length * sinAlpha) + y0
    return { x: x1, y: y1 }
}

// var c = availableSize * 1.5 
//     var n = 8 
//     var sector = 360 / n 
//     var x0 = chartAreaSize / 2 
//     var y0 = x0 

//     var circleRadius = 0

//     for (i = 1; i <= n; i++) {
//         var alpha = sector * i
//         var sinAlpha = toDegrees(Math.sin(toRadians(alpha)))
//         var cosAlpha = toDegrees(Math.cos(toRadians(alpha)))
//         var x1 = (c * (cosAlpha / 180)) + x0
//         var y1 = (c * (sinAlpha / 180)) + y0

//         if (i == 1) { 
//             var deltaX = x1 - x0
//             var deltaY = y1 - y0
//             circleRadius = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY))
//         }