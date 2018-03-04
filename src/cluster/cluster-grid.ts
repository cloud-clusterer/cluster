import { Vector2D } from 'simple-gl'

export default class ClusterGrid<T>{
    topLeft: Vector2D
    width: number
    height: number
    cells: Array<ClusterGridCell<T>>
    constructor(topLeft: Vector2D, width: number, height: number, segmentsWide: number, segmentsHigh: number){
        this.topLeft = topLeft
        this.width = width
        this.height = height
        this.cells = this.createCells(segmentsWide, segmentsHigh)
    }
    private createCells(segmentsWide: number, segmentsHigh: number): Array<ClusterGridCell<T>>{
        let cellWidth = this.width / segmentsWide
        let cellHeight = this.height / segmentsHigh
        let cellWidthExcess = cellWidth * 0.1
        let cellHeightExcess = cellHeight * 0.1
        let cells = []
        for(let x = this.topLeft.x;x<this.topLeft.x+this.width;x+=cellWidth){
            for(let y = this.topLeft.y;y<this.topLeft.y+this.height;y+=cellHeight){
                let actualX = x-cellWidthExcess
                let actualY = y-cellHeightExcess
                cells.push(new ClusterGridCell<T>(new Vector2D(actualX,actualY), new Vector2D(x+cellWidth+cellWidthExcess, y+cellHeight+cellHeightExcess)))
            }
        }
        return cells
    }

    register(node: T, location: Vector2D){
        this.cells.forEach((cell: ClusterGridCell<T>) => cell.register(node, location))
    }

    cellsFor(node: T): Array<ClusterGridCell<T>>{
        return this.cells.filter((cell: ClusterGridCell<T>) => cell.nodes.has(node))
    }

    nodesInCellsWith(node: T): Array<T>{
        let nodes: Array<T> = []
        this.cellsFor(node).forEach((cell: ClusterGridCell<T>) => cell.nodes.forEach((n: T) => nodes.push(n)))
        return nodes
    }
}

class ClusterGridCell<T>{
    topLeft: Vector2D
    bottomRight: Vector2D
    nodes: Set<T> = new Set<T>()
    constructor(topLeft: Vector2D, bottomRight: Vector2D){
        this.topLeft = topLeft
        this.bottomRight = bottomRight
    }
    register(node: T, location: Vector2D){
        if(location.x >= this.topLeft.x && location.x <= this.bottomRight.x && location.y >= this.topLeft.y && location.y <= this.bottomRight.y){
            this.nodes.add(node)
        }
        else{
            this.nodes.delete(node)
        }
    }
}