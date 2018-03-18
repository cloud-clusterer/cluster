import * as React from 'react'
import ClusterGl from './cluster-gl'
import Cluster from '../cluster/cluster'
import ClusterNode from '../cluster/cluster-node'
import ClusterLink from '../cluster/cluster-link'
import { generate } from '../data-generator'
import {cluster} from './dummy-data'
import { Vector2D } from 'simple-gl'

export default class App extends React.Component<{},{}> {

    cluster: Cluster
    group = 0

    componentWillMount(){
        this.cluster = Cluster.from(cluster[1], new Vector2D(-30,-30), 60, 60)
        //window.onblur = () => this.cluster.pause()
        window.onfocus = () => {
            this.cluster.play()
            this.cluster = Cluster.from(cluster[this.group++], new Vector2D(-30,-30), 60, 60)
            this.setState({})
        }
    }
    
    render(){

        return <ClusterGl cluster={this.cluster}/>
    }
}