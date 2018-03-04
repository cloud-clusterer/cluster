import * as React from 'react'
import ClusterGl from './cluster-gl'
import Cluster from '../cluster/cluster'
import ClusterNode from '../cluster/cluster-node'
import ClusterLink from '../cluster/cluster-link'
import { cluster } from './dummy-data'

export default class App extends React.Component<{},{}> {

    cluster: Cluster

    componentWillMount(){
        this.cluster = Cluster.from(cluster)
    }
    
    render(){

        return <div>
            <ClusterGl cluster={this.cluster}/>
        </div>
    }
}