/*
var tree = {
    root: {
        name: 'Root', 
        value: 'RT',
        children: [
            {
                name: 'Level1',
                value: 'L1',
                children: [
                    { 
                        name: 'Level2', 
                        value: 'L2', 
                        children: [ ]  
                    }
                ]
            }
        ]
    }
}
*/


function getUniqueValuesForKey(key, data) {
    var value = data.map(d=>d[key]).sort()
    var uniqueValues = [ value[0] ]

    var i = 0
    for (i = 1; i < value.length; i++) {
        if (value[i] != value[i-1]) {
            uniqueValues.push(value[i])
        }
    }

    return uniqueValues
}

function hasChildren(node) { 
    return Array.isArray(node.children) && node.children.length > 0 
}



function drawCircle(svg, x, y, radius, fillColor, strokeColor, strokeWidth = 0) {
    return svg.append('circle')
                .attr('cx', x)
                .attr('cy', y)
                .attr('r', radius)
                .attr('fill', fillColor)
                .attr('stroke', strokeColor ?? fillColor)
                .attr('stroke-width', strokeWidth)
}

function drawLine(svg, x0, y0, x1, y1, strokeColor = 'gray', strokeWidth = 1) {
    return svg.append('line')
                .attr('x1', x0)
                .attr('y1', y0)
                .attr('x2', x1)
                .attr('y2', y1)
                .attr('stroke', strokeColor)
                .attr('stroke-width', strokeWidth)
}



function createNodesCoordinate(tree, size, origin) { 

    var placed  = tree.levels.map(_ => 0)
    var sectors = tree.levels.map(level => -360 / level.length)
    var space   = (size * 0.5) / tree.levels.length

    function createNodeCoordinate(node, level) { 

        if (hasChildren(node)) { 
            node.children.forEach(child => createNodeCoordinate(child, level + 1))
        }
    
        var sector = sectors[level]
        var distance = space * level
        var angle = sector * (placed[level] + 1)

        if (hasChildren(node) && tree.levels[level + 1].length > tree.levels[level].length) { 
            angle = (sectors[level + 1] * placed[level + 1]) - (sectors[level + 1] * Math.round(node.children.length * 0.5))
        }
        
        var coordinate = getCoordenate(origin.x, origin.y, distance, angle)
        // node.coordinate = coordinate
        node.coordinates.push(coordinate)
    
        placed[level] += 1

    }
    
    createNodeCoordinate(tree.root, 0)

}

function createNodesCoordinates(tree, size, origin) {

    function updateAuxTreeLevels(node, auxTreeLevels, level) {
        if (hasChildren(node)) {
            auxTreeLevels[level + 1].length += node.children.length
            node.children.forEach(child => updateAuxTreeLevels(child, auxTreeLevels, level + 1))
        }
    }

    function createNodesCoordinateWithCenterNode(centerNode, level) {

        if (!hasChildren(centerNode)) {
            return
        }

        var auxTreeLevels = tree.levels.map((_, index) => index >= level ? { length: 0 } : null).filter(level => level != null)
        updateAuxTreeLevels(centerNode, auxTreeLevels, 0)
        auxTreeLevels[0].length = 1

        var auxTree = {
            root: centerNode,
            levels: auxTreeLevels
        }

        createNodesCoordinate(auxTree, size, origin)

        if (hasChildren(centerNode)) {
            centerNode.children.forEach(child => createNodesCoordinateWithCenterNode(child, level + 1))
        }

    }

    createNodesCoordinate(tree, size, origin)

    if (hasChildren(tree.root)) {
        tree.root.children.forEach(child => createNodesCoordinateWithCenterNode(child, 1))
    }
}

function createNodesSize(tree, size) {

    var space = (size * 0.5) / tree.levels.length

    tree.levels.forEach(function (level, i) { 
        var distance = space * i
        var radius = ((2 * Math.PI * distance) / level.length) * 0.5 * 0.9
        level.radius = radius <= 0 || radius > (space * 0.5) ? space * 0.5 * 0.9 : radius
    })

    function adjust(nodesFromLevel, level) { 
        var shortestDistance = nodesFromLevel.map((node, index) => getDistance(node.coordinates[0], nodesFromLevel[(index < nodesFromLevel.length - 1) ? index + 1 : 0].coordinates[0])).sort((a,b)=>a-b)[0]
        if (shortestDistance <= (tree.levels[level].radius * 2)) {
            tree.levels[level].radius = shortestDistance * 0.5 * 0.9
        }

        var nextLevelNodes = []
        nodesFromLevel.forEach(function (node) { 
            if (hasChildren(node)) { nextLevelNodes = nextLevelNodes.concat(node.children) } 
        })

        if (nextLevelNodes.length > 0) {
            adjust(nextLevelNodes, level + 1)
        }
    }

    adjust(tree.root.children, 1)

}

/*
function createNodesSizes(tree, size, origin) {

    function updateAuxTreeLevels(node, auxTreeLevels, level) {
        if (hasChildren(node)) {
            auxTreeLevels[level + 1].length += node.children.length
            node.children.forEach(child => updateAuxTreeLevels(child, auxTreeLevels, level + 1))
        }
    }

    function createNodesSizeeWithCenterNode(centerNode, level) {

        if (!hasChildren(centerNode)) {
            return
        }

        var auxTreeLevels = tree.levels.map((_, index) => index >= level ? { length: 0, radius: [] } : null).filter(level => level != null)
        updateAuxTreeLevels(centerNode, auxTreeLevels, 0)
        auxTreeLevels[0].length = 1

        var auxTree = {
            root: centerNode,
            levels: auxTreeLevels
        }

        createNodesSize(auxTree, size, origin) ;print(auxTree.levels)

        if (hasChildren(centerNode)) {
            centerNode.children.forEach(child => createNodesSizeeWithCenterNode(child, level + 1))
        }

    }

    createNodesSize(tree, size, origin)

    if (hasChildren(tree.root)) {
        tree.root.children.forEach(child => createNodesSizeeWithCenterNode(child, 1))
    }
}
*/



function drawBranches(svg, tree) {

    function drawBranchesForNode(node, level) {
        if (hasChildren(node)) {
            node.children.forEach(function (child) {
                var line = drawLine(svg, node.coordinates[0].x, node.coordinates[0].y, child.coordinates[0].x, child.coordinates[0].y, 'white', '1')

                line.classed('line-' + node.name.toLowerCase().split(' ').join('-'), true)
                line.classed('line-level-' + level, true)
                line.classed('line-level-' + ((level + 1) % 2 == 0 ? 'even' : 'odd'), true)
                line.classed('line-' + tree.levels[level + 1].name, true)

                child.svg['line'] = line

                drawBranchesForNode(child, level + 1)
            })
        }
    }

    drawBranchesForNode(tree.root, 0)

}

function drawNodes(svg, tree) {

    function drawNode(node, level) {
        var circle = drawCircle(svg, node.coordinates[0].x, node.coordinates[0].y, tree.levels[level].radius, 'white', 'white', 0)

        circle.classed('node-' + node.name.toLowerCase().split(' ').join('-'), true)
        circle.classed('node-level-' + level, true)
        circle.classed('node-level-' + (level % 2 == 0 ? 'even' : 'odd'), true)
        circle.classed('node-' + tree.levels[level].name, true)

        circle.attr('style', 'cursor: pointer;')
        circle.attr('onclick', 'javascript:didClickNodeWithId(' + node.id + ')')
        
        var text = svg.append('text')
                .text(node.value)
                .attr('x', node.coordinates[0].x - ((node.value.length > 2 ? 4.5 : 6) * node.value.length))
                .attr('y', node.coordinates[0].y + 5)
                .attr('fill', 'black')

        text.classed('text-' + node.name.toLowerCase().split(' ').join('-'), true)
        text.classed('text-level-' + level, true)
        text.classed('text-level-' + (level % 2 == 0 ? 'even' : 'odd'), true)
        text.classed('text-' + tree.levels[level].name, true)

        text.attr('style', 'cursor: pointer;')
        text.attr('onclick', 'javascript:didClickNodeWithId(' + node.id + ')')

        node.svg['node'] = circle
        node.svg['text'] = text
        
        if (hasChildren(node)) {
            node.children.forEach(child => drawNode(child, level + 1))
        }
    }

    drawNode(tree.root, 0)

}

function drawLegend(chartAreaSize) {

    var labels = ['New Cases', 'Acumulated New Cases', 'New Deaths', 'Acumulated New Deaths' ]
    var colors = ['#FFD500', '#FF8106', '#FE7F9C', '#ED2939']

    var legendRowWidth = 300
    var legendRowHeight = (chartAreaSize * 0.5)  / labels.length 
    var colorSize = legendRowHeight <= 50 ? legendRowHeight * 0.8 : 50

    var svg = d3.select('#chartarea').append('svg')
                                        .attr('width', legendRowWidth)
                                        .attr('height', labels.length * legendRowHeight)

    labels.forEach(function(label,i) {
        var group = svg.append('g').attr('transform', 'translate(0,' + (i * legendRowHeight) + ')')
        var color = group.append('rect')
                            .attr('x', 10)
                            .attr('y', (legendRowHeight * 0.5) - (colorSize * 0.5 * 0.2))
                            .attr('width', colorSize)
                            .attr('height', colorSize * 0.2)
                            .attr('fill', colors[i])
            
        group.append('text')
                .attr('x', colorSize + 20)
                .attr('y', legendRowHeight * 0.5)
                .text(label.split(' ').join('\n'))
                .attr('fill', 'white')
                
    })
}


function drawTree(tree, size) {

    var margin = 10
    var availableSize = size - (2 * margin)

    var origin = {
        x: size * 0.5,
        y: size * 0.5
    }

    var svg = d3.select('#chartarea')
                    .append('svg')
                        .attr('width', size)
                        .attr('height', size)

    createNodesCoordinates(tree, availableSize, origin)
    createNodesSize(tree, availableSize)
    drawBranches(svg, tree)
    drawNodes(svg, tree)
    // drawLegend(size)

}

var _lastNodeId = 1

function createNode(name, value, center = false) {
    return {
        id: _lastNodeId++,
        name: name,
        value: value,
        children: [ ],
        parent: null,
        svg: { line: null, node: null, text: null },
        coordinates: [ ],
        center: center,
        level: 0,
        radius: [ ]
    }
}

function drawRadialTreeFromCSV(filePath, chartAreaSize, rootNodeName = 'R') {

    function searchNodeWithValueAtLevel(node, value, level, currentLevel) {
        if (currentLevel == level) {
            return node.value == value ? node : null
        } 
        
        var results = [ ]
        var i = 0
        for (i = 0; i < node.children.length; i++) {
            var child = node.children[i]
            var result = searchNodeWithValueAtLevel(child, value, level, currentLevel + 1)
            results.push(result)
            // if (result != null) {
            //     return result
            // }
        }

        if (results.length > 0) {
            return results[results.length - 1]
        }

        return null
    }

    function hasChildWithValue(node, value) {
        for (var i = 0; i < node.children.length; i++) {
            if (node.children[i].value == value) {
                return true
            }
        }
        return false
    }

    function didReadFile(lines) {

        var tree = {
            root: createNode('Root', rootNodeName, true),
            levels: [
                { name: 'root', length: 1 }
            ]
        } 
        
        d3.keys(lines[0]).forEach(key => tree.levels.push({name: key.toLowerCase().split(' ').join('-'), length: 0 }))

        var i = 0
        for (i = 0; i < lines.length; i++) { 
            var line = lines[i]
            var keys = d3.keys(line)
            var values = d3.values(line)
            
            for (j = 0; j < keys.length; j++) { 
                var key = keys[j]
                var value = values[j]
                
                if (value == '') {
                    continue
                }

                var parentNode = null
                if (j > 0) {
                    parentNode = searchNodeWithValueAtLevel(tree.root, values[j-1], j, 0)
                } else {
                    parentNode = tree.root
                }
                
                if (parentNode != null && !hasChildWithValue(parentNode, value)) {
                    var childNode = createNode(key, value)
                    childNode.level = j + 1
                    parentNode.children.push(childNode)
                    childNode.parent = parentNode
                    tree.levels[j+1].length += 1
                }
            }
        }

        _currentCenterNode = tree.root
        drawTree(tree, chartAreaSize)
        _tree = tree
        print(tree)
    }

    d3.dsv(';', filePath).then(didReadFile)

}

drawRadialTreeFromCSV('radialtree.csv', 1000, 'BR')

var _currentCenterNode = null

var _tree = null

function findNodeWithIdFromNode(originNode, nodeId) { 

    if (originNode.id == nodeId) {
        return originNode
    }

    if (hasChildren(originNode)) {
        var results = null
        results = originNode.children.map(child => findNodeWithIdFromNode(child, nodeId))
        results = results.filter(result => result != null)
        
        if (results.length > 0) {
            return results[0]
        }
    }

    return null
}



function hideAllNodesExcepteNodeWithIdFromNode(originNode, nodeId, callback = null, hideLineAnimationDuration = 500, hideNodeAndTextAnimationDuration = 500, delay = 0) {

    var linesToHide = []
    var elemsToHide = []

    function separateSVGElements(node) {

        if (node.id == nodeId) {
            linesToHide.push(node.svg.line)
            return
        }

        if (node.svg.line != null) { 
            linesToHide.push(node.svg.line)
        }

        elemsToHide.push(node.svg)

        if (hasChildren(node)) {
            node.children.forEach(child => separateSVGElements(child))
        }

    }

    separateSVGElements(originNode)

    var totalOfTransitions   = 0
    var endedTransitions     = 0
    var endedLineTransitions = 0

    totalOfTransitions += linesToHide.length 
    totalOfTransitions += elemsToHide.length

    linesToHide.forEach(function(line) {
        line.transition()
                .duration(hideLineAnimationDuration)
                .delay(delay)
                .style('opacity', 0)
                .on('end', function() {

                    line.style('disply', 'none')
                    endedLineTransitions += 1
                    endedTransitions += 1

                    if (endedLineTransitions == linesToHide.length) {
                        
                        // DID FINISH HIDDING ALL THE LINES

                        elemsToHide.forEach(function(element) {
                            element.node.transition()
                                    .duration(hideNodeAndTextAnimationDuration)
                                    .delay(delay)
                                    .style('opacity', 0)
                                    .on('end', function() {

                                        element.node.style('disply', 'none')
                                        element.node.attr('r', 0)
                                        endedTransitions += 1
                                        if (endedTransitions == totalOfTransitions && callback != null) {
                                            callback()
                                        }

                                    })

                            element.text.transition()
                                    .duration(hideNodeAndTextAnimationDuration)
                                    .delay(delay)
                                    .style('opacity', 0)
                                    .on('end', function() {

                                        element.text.style('disply', 'none')
                                        element.text.text(null)
                                        endedTransitions += 1
                                        if (endedTransitions == totalOfTransitions && callback != null) {
                                            callback()
                                        }

                                    })
                        })

                    }

                })
    })
}

function showAllNodesExcepteNodeWithIdFromNode(originNode, nodeId, callback = null, showLineAnimationDuration = 500, showNodeAndTextAnimationDuration = 500, delay = 0) {

    var linesToShow = []
    var nodesToShow = []

    function separateSVGElements(node) {

        if (node.id == nodeId) {
            linesToShow.push(node.svg.line)
            return
        }

        if (node.svg.line != null && node.id != originNode.id) { 
            linesToShow.push(node.svg.line)
        }

        nodesToShow.push(node)

        if (hasChildren(node)) {
            node.children.forEach(child => separateSVGElements(child))
        }

    }

    separateSVGElements(originNode)

    var totalOfTransitions    = 0
    var endedTransitions      = 0
    var endedNodesTransitions = 0

    totalOfTransitions += linesToShow.length 
    totalOfTransitions += nodesToShow.length

    function showLines() {

        // DID FINISH SHOWING ALL NODES AND TEXTS

        linesToShow.forEach(function(line) {
            line.transition()
                    .duration(showLineAnimationDuration)
                    .delay(delay)
                    .style('disply', '?')
                    .style('opacity', 1)
                    .on('end', function() {

                        endedTransitions += 1
                        if (endedTransitions == totalOfTransitions && callback != null) {
                            callback()
                        }

                    })
        })

    }

    nodesToShow.forEach(function(node) {
        var element = node.svg
        element.node.attr('r', _tree.levels[node.level].radius)
        element.text.text(node.value)
        element.node.transition()
                .duration(showNodeAndTextAnimationDuration)
                .delay(delay)
                .style('disply', '?')
                .style('opacity', 1)
                .on('end', function() {

                    endedNodesTransitions += 1
                    endedTransitions += 1

                    if (endedNodesTransitions == nodesToShow.length) {
                        
                        showLines()

                    }

                })

        element.text.transition()
                .duration(showNodeAndTextAnimationDuration)
                .delay(delay)
                .style('disply', '?')
                .style('opacity', 1)
                .on('end', function() {

                    endedNodesTransitions += 1
                    endedTransitions += 1

                    if (endedNodesTransitions == nodesToShow.length) {
                        
                        showLines()

                    }

                })
    })
}



function moveNodesFromCenterNode(centerNode, callback = null, duration = 1000, delay = 0) {

    var elementsToMove = []

    function separateSVGElements(node) {
        elementsToMove.push(node)
        if (hasChildren(node)) {
            node.children.forEach(child => separateSVGElements(child))
        }
    }

    separateSVGElements(centerNode)

    var totalOfTransitions   = 0
    var endedTransitions     = 0

    totalOfTransitions += elementsToMove.length 

    elementsToMove.forEach(function(element) {
        var c = element.coordinates[centerNode.level]
        element.svg.node.transition()
                            .duration(duration)
                            .delay(delay)
                            .attr('cx', c.x)
                            .attr('cy', c.y)
                            .on('end', function() {
                                endedTransitions += 1
                                if (endedTransitions == totalOfTransitions && callback != null) {
                                    callback()
                                }
                            })
    })

    elementsToMove.forEach(function(element) {
        var c = element.coordinates[centerNode.level]
        element.svg.text.transition()
                            .duration(duration)
                            .delay(delay)
                            .attr('x', c.x - ((element.value.length > 2 ? 4.5 : 6) * element.value.length))
                            .attr('y', c.y + 5)
                            .on('end', function() {
                                endedTransitions += 1
                                if (endedTransitions == totalOfTransitions && callback != null) {
                                    callback()
                                }
                            })
    })

}

function moveBranchesFromCenterNode(centerNode, callback = null, duration = 1000, delay = 0) {

    var elementsToMove = []

    function separateSVGElements(from, to) {
        elementsToMove.push({ line: to.svg.line, 
                              from: from.coordinates[centerNode.level], 
                              to: to.coordinates[centerNode.level] })
        if (hasChildren(to)) {
            to.children.forEach(child => separateSVGElements(to, child))
        }
    }
    
    if (hasChildren(centerNode)) {
        centerNode.children.forEach(child => separateSVGElements(centerNode, child, centerNode.level))

        var totalOfTransitions   = 0
        var endedTransitions     = 0

        totalOfTransitions += elementsToMove.length 

        elementsToMove.forEach(function(element) {
            element.line.transition()
                            .duration(duration)
                            .delay(delay)
                            .attr('x1', element.from.x)
                            .attr('y1', element.from.y)
                            .attr('x2', element.to.x)
                            .attr('y2', element.to.y)
                            .on('end', function() {
                                endedTransitions += 1
                                if (endedTransitions == totalOfTransitions && callback != null) {
                                    callback()
                                }
                            })
        })
    }
}



function forwards(id) {
    var node = findNodeWithIdFromNode(_currentCenterNode, id)

    if (node == null) {
        return
    }

    if (!hasChildren(node)) {
        window.alert((node.parent.value ?? '') + ' - ' + node.name + ': ' + node.value)
        return
    }

    hideAllNodesExcepteNodeWithIdFromNode(_currentCenterNode, id, function() {
        _currentCenterNode.center = false
        _currentCenterNode = node
        _currentCenterNode.center = true

        moveNodesFromCenterNode(_currentCenterNode)
        moveBranchesFromCenterNode(_currentCenterNode)
    })
}

function backwards(id) {
    var node = findNodeWithIdFromNode(_currentCenterNode, id)

    if (node == null || node.parent == null) {
        return
    }

    _currentCenterNode.center = false
    _currentCenterNode = node.parent
    _currentCenterNode.center = true

    moveNodesFromCenterNode(_currentCenterNode)
    moveBranchesFromCenterNode(_currentCenterNode, function(){
        showAllNodesExcepteNodeWithIdFromNode(_currentCenterNode, id)
    })
}



function didClickNodeWithId(id) {
    if (_currentCenterNode == null) {
        return
    }

    (_currentCenterNode.id == id ? backwards : forwards)(id)
}