import ClusterNode from './cluster-node'
import ClusterLink from './cluster-link'
import ClusterGrid from './cluster-grid'
import { Vector2D } from 'simple-gl'

export default class Cluster{
    nodes: Array<ClusterNode>
    links: Array<{link: ClusterLink, a: ClusterNode, b: ClusterNode}>
    clusterGrid: ClusterGrid<ClusterNode>

    constructor(nodes: Array<ClusterNode>, links: Array<ClusterLink>, topLeft: Vector2D, width: number, height: number){
        this.nodes = nodes.filter(
            (node: ClusterNode) => (
                node.info.type == "AWS::SNS::Topic" ||
                node.info.type == "AWS::Lambda::Function" ||
                node.info.type == "AWS::IAM::Role"
            )
        )
        this.links = this.buildLinks(this.validate(links))
        this.colorNodes()
        this.nodes = this.validateNodes(this.nodes)
        this.clusterGrid = new ClusterGrid<ClusterNode>(topLeft, width, height, 30, 30)

    }

    validateNodes(nodes: Array<ClusterNode>): Array<ClusterNode>{
        return nodes.filter((node: ClusterNode) =>  !!this.links.find((link: {link: ClusterLink, a: ClusterNode, b: ClusterNode}) => link.link.uuidA == node.uuid || link.link.uuidB == node.uuid) )
    }

    buildLinks(links: Array<ClusterLink>): Array<{link: ClusterLink, a: ClusterNode, b: ClusterNode}>{
        return links.map((link: ClusterLink) => {
            return {
                link: link,
                a: this.find(link.uuidA),
                b: this.find(link.uuidB)
            }
        })
    }

    colorNodes(){
        let nodeTypes = new Set<string>()
        this.nodes.forEach((node: ClusterNode) => nodeTypes.add(node.info.type))
        let colors = new Map<string, number[]>()
        nodeTypes.forEach((nodeType: string) => {
            colors.set(nodeType, [Math.random(),Math.random(),Math.random(),1] )
        })
        let num = 0
        this.nodes.forEach((node: ClusterNode) => node.setColor(colors.get(node.info.type)))
    }

    find(uuid: string): ClusterNode | undefined {
        return this.nodes.find((node: ClusterNode) => node.uuid == uuid)
    }

    nodeExists(uuid: string): boolean {
        return !!this.find(uuid)
    }

    validate(links: Array<ClusterLink>): Array<ClusterLink>{
        return links.filter(
            (link: ClusterLink) => {
                if(link.uuidA != link.uuidB && this.nodeExists(link.uuidA) && this.nodeExists(link.uuidB)) return true
                else{
                    console.warn('No node found for link (' + link.uuidA + ', ' + link.uuidB + '), or is linked to self')
                    return false
                }
            }
        )
    }
    update(time: number){
        let positions = this.nodes.map((node: ClusterNode) => [node, node.transformedPosition()])
        positions.forEach(([node, position]: [ClusterNode, Vector2D]) => this.clusterGrid.register(node, position))
        positions.forEach(([nodeA, positionA]: [ClusterNode, Vector2D]) => {
            let force = new Vector2D(0,0)
            let others = this.clusterGrid.nodesInCellsWith(nodeA)
            others.forEach((nodeB: ClusterNode) => {
                let positionB = nodeB.transformedPosition()
                if(nodeB != nodeA){
                    let diff = positionA.subtract(positionB)
                    let distance = diff.length()
                    let direction = diff.direction(distance)
                    let magnitude = 0.1/(distance)
                    force = force.translate(direction.scale(magnitude))
                }
            })
            nodeA.velocity = nodeA.velocity.translate(force.scale(time))
        })

        this.links.forEach((link: {link: ClusterLink, a: ClusterNode, b: ClusterNode})=> {
            var difference = link.b.transformedPosition().subtract(link.a.transformedPosition());
            var diffLength = difference.length();
            var towardB = difference.direction(diffLength);
            var comparedToDesired = diffLength - 2;
            var force = comparedToDesired * 0.01;
            var directionalForce = towardB.scale(force);
            var reverseForce = directionalForce.scale(-1);
            link.a.velocity = link.a.velocity.translate(directionalForce);
            link.b.velocity = link.b.velocity.translate(reverseForce);
        })

        this.nodes.forEach((node: ClusterNode) => node.update(time))
    }

    static from(cluster: any, topLeft: Vector2D, width: number, height: number): Cluster{
        let nodes = cluster.nodes.map((node: any) => ClusterNode.from(node))
        let links = cluster.links.map((link: any) => ClusterLink.from(link))
        return new Cluster(nodes, links, topLeft, width, height)
    }

}