import { GLPolygon, Vector2D } from 'simple-gl'

export default class ClusterNode extends GLPolygon{
    uuid: string
    name: string
    info: ClusterNodeInfo
    velocity: Vector2D = new Vector2D(0,0)

    constructor(uuid: string, name: string, info: ClusterNodeInfo){
        super(6,(0.1), new Vector2D(Math.random()*10-5, Math.random()*10-5))
        this.setColor([Math.random(), Math.random(), Math.random(), 1])
        this.uuid = uuid
        this.name = name
        this.info = info
    }

    update(time: number){
        this.velocity = this.velocity.scale(0.99)
        this.transform = this.transform.translate(this.velocity.scale(time))
    }

    static from(node: any): ClusterNode{
        return new ClusterNode(node.uuid, node.name, ClusterNodeInfo.from(node.info))
    }
}

export class ClusterNodeInfo{
    title: string
    type: string
    size: number
    otherProperties: { [key: string]: string }
    constructor(title: string, type: string, size: number = 1, otherProperties: { [key: string]: string } = {}){
        this.title = title
        this.type = type
        this.size = size
        this.otherProperties = otherProperties
    }

    static from(info: any): ClusterNodeInfo{
        return new ClusterNodeInfo(info.title,info.type, info.size, info.otherProperties)
    }
}