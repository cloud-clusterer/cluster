import ClusterNode from './cluster-node'
import ClusterLink from './cluster-link'

export default class Cluster{
    nodes: Array<ClusterNode>
    links: Array<ClusterLink>
    constructor(nodes: Array<ClusterNode>, links: Array<ClusterLink>){
        this.nodes = nodes
        this.links = this.validate(links)
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
        this.nodes.forEach((node: ClusterNode) => node.update(time))
    }

    static from(cluster: any): Cluster{
        let nodes = cluster.nodes.map((node: any) => ClusterNode.from(node))
        let links = cluster.links.map((link: any) => ClusterLink.from(link))
        return new Cluster(nodes, links)
    }

}