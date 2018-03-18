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
        cluster.map((nodeTree) => {
            let nameSet = new Map<string, number>()
            nodeTree.nodes.forEach((node) => {
                this.wordsFrom(node).forEach((word) => {
                    let wordCount = 0
                    if(nameSet.has(word)){
                        wordCount = nameSet.get(word)
                    }
                    nameSet.set(word, wordCount+1)
                })
                
            })
            let max = {word: '', count:0}
            nameSet.forEach((value, key) => {
                if(value > max.count){
                    max = {word: key, count: value}
                }
            })
            return {nodeTree: nodeTree, name: max.word }
        }).forEach((item) => console.log(item.name))
    }

    wordsFrom(node:any): Array<string>{
        let title:string = node.info.title
        return title.split('-')
    }
    
    render(){

        return <ClusterGl cluster={this.cluster}/>
    }
}