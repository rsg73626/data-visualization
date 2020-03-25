
function print(content) {
    console.log(content)
}

function logError(content) {
    console.error('ERROR: ' + content)
}

function addError(content) {
    d3.select('body').append('h3')
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