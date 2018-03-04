import * as React from 'react'
import ClusterGl from './cluster-gl'
import Cluster from '../cluster/cluster'
import ClusterNode from '../cluster/cluster-node'
import ClusterLink from '../cluster/cluster-link'
import { cluster } from './dummy-data'
import { Vector2D } from 'simple-gl'

export default class App extends React.Component<{},{}> {

    cluster: Cluster

    componentWillMount(){
        this.cluster = Cluster.from(cluster, new Vector2D(-10,-10), 20, 20)
    }
    
    render(){

        return <div>
            <ClusterGl cluster={this.cluster}/>
        </div>
    }
}