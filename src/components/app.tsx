import * as React from 'react'
import ClusterGl from './cluster-gl'
import Cluster from '../cluster/cluster'
import ClusterNode from '../cluster/cluster-node'
import ClusterLink from '../cluster/cluster-link'
import { generate } from '../data-generator'
import { Vector2D } from 'simple-gl'

export default class App extends React.Component<{},{}> {

    cluster: Cluster

    componentWillMount(){
        this.cluster = Cluster.from(generate(), new Vector2D(-30,-30), 60, 60)
        window.onblur = () => this.cluster.pause()
        window.onfocus = () => this.cluster.play()
    }
    
    render(){

        return <ClusterGl cluster={this.cluster}/>
    }
}