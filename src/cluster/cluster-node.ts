import { GLPolygon, Vector3D } from 'simple-gl'

export default class ClusterNode extends GLPolygon{
    uuid: string
    name: string
    info: ClusterNodeInfo
    velocity: Vector3D = new Vector3D(0,0,0)
    highlight: Boolean = false

    constructor(uuid: string, name: string, info: ClusterNodeInfo){
        super(6,(0.2), new Vector3D(Math.random()*10-5,Math.random()*10-5,0))
        this.setColor([Math.random(), Math.random(), Math.random(), 1])
        this.lineColor = [0,1,0,1]
        this.uuid = uuid
        this.name = name
        this.info = info
    }

    update(time: number){
        this.velocity = this.velocity.scale(0.99)
        this.transform = this.transform.translate(this.velocity.scale(time))
    }

    lines(): number[]{ return this.highlight?[1,2,3,4,5,6,7]:[] }

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