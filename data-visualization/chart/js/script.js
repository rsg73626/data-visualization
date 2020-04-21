
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

function includeHTML(completion = null) {
    var z, i, elmnt, file, xhttp
    /*loop through a collection of all HTML elements:*/
    z = document.getElementsByTagName("*")
    for (i = 0; i < z.length; i++) {
      elmnt = z[i]
      /*search for elements with a certain atrribute:*/
      file = elmnt.getAttribute("w3-include-html")
      if (file) {
        /*make an HTTP request using the attribute value as the file name:*/
        xhttp = new XMLHttpRequest()
        xhttp.onreadystatechange = function() {
          if (this.readyState == 4) {
            if (this.status == 200) {
                elmnt.innerHTML = this.responseText
                if ((typeof completion) == 'function') {
                    completion()
                }
            }
            if (this.status == 404) {elmnt.innerHTML = "Page not found."}
            /*remove the attribute, and call this function once more:*/
            elmnt.removeAttribute("w3-include-html")
            includeHTML()
          }
        }      
        xhttp.open("GET", file, true)
        xhttp.send()
        /*exit the function:*/
        return
      }
    }

    /*
    <div w3-include-html="content.html"></div> 
    <script> includeHTML() </script>
    */

}

var _relativeMenuLinkPath = ''
var _homeRelativeMenuLinkPath = ''

function adjustMenuLinkPaths() {
    var menuLinks = document.getElementsByClassName('menu-link')
    for (i = 0; i < menuLinks.length; i++) { 
        var menuLink = menuLinks[i]
        menuLink.href = menuLink.href.replace('relativePath', _relativeMenuLinkPath)
    }
    var homeMenuLinks = document.getElementById('menu-home-link')
    homeMenuLinks.href = homeMenuLinks.href.replace('homeRelativePath', _homeRelativeMenuLinkPath)
}

function createNavigationMenu(relativeMenuLinkPath = null, homeRelativeMenuLinkPath = null) {
    if ((typeof relativeMenuLinkPath) == 'string' && relativeMenuLinkPath.trim().length > 0) {
        _relativeMenuLinkPath = relativeMenuLinkPath
    }
    if ((typeof homeRelativeMenuLinkPath) == 'string' && homeRelativeMenuLinkPath.trim().length > 0) {
        _homeRelativeMenuLinkPath = homeRelativeMenuLinkPath
    }
    includeHTML(adjustMenuLinkPaths)
}

function tryToCreateColorObjectFromValue(value) {

    var color = { r: 100, g: 100, b: 100, a: 1 }

    if ((typeof value) == 'string' && value.trim() != '') {

        valueSplit = value.trim().split(';') 

        if (valueSplit.length == 3) {

            var colorValues = []

            valueSplit.forEach(function(v){
                var value = Number(v)
                if (!isNaN(value) && value >= 0 && value <= 255) {
                    colorValues.push(value)
                }
            })

            if (colorValues.length == 3) {
                color.r = colorValues[0]
                color.g = colorValues[1]
                color.b = colorValues[2]
            } 

        } 

    }

    return color

}

function rgbFromColorObject(colorObject) {
    return 'rgba(' + colorObject.r + ', ' + colorObject.g + ', ' + colorObject.b + ', ' + colorObject.a + ')'
}