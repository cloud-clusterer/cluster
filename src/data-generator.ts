import Cluster from './cluster/cluster'
import ClusterNode, { ClusterNodeInfo } from './cluster/cluster-node';
import { Vector2D } from 'simple-gl';
import ClusterLink from './cluster/cluster-link';
export const generate = (): any => {

    let types = []
    for(let i = 0;i<5;i++){
        types.push(randomString())
    }

    let nodes = []
    for(var i = 0;i<100;i++){
        let type = types[Math.floor(Math.random()*5)]
        let otherInfo: any = {}
        otherInfo[randomString(4)] = randomString()
        otherInfo[randomString(4)] = randomString()
        otherInfo[randomString(4)] = randomString()
        nodes.push(new ClusterNode(randomString(15), randomString(), new ClusterNodeInfo(randomString(),type,1,otherInfo)))
    }

    let links = []
    for(var i = 0;i<100;i++){
        let a = nodes[Math.floor(Math.random()*100)]
        let b = nodes[Math.floor(Math.random()*100)]
        links.push({uuidA: a.uuid, uuidB: b.uuid})
    }
    return {nodes: nodes, links: links}
}

const randomChar = (): string => String.fromCharCode(97 + Math.floor(Math.random()*26))
const randomString = (length: number = 8): string => {
    let s = ''
    for(let i = 0;i<length;i++){
        s += randomChar()
    }
    return s
}