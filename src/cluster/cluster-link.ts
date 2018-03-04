export default class ClusterLink{
    uuidA: string
    uuidB: string
    direction: ClusterLinkDirection
    constructor(uuidA: string, uuidB: string, direction: ClusterLinkDirection = ClusterLinkDirection.NONE){
        this.uuidA = uuidA
        this.uuidB = uuidB
        this.direction = direction
    }
    static from(link: any): ClusterLink{
        return new ClusterLink(link.uuidA, link.uuidB, link.direction)
    }
}
export enum ClusterLinkDirection{ FORWARD, BACKWARD, BOTH, NONE }