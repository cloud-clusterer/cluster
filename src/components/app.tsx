import * as React from 'react'
import ClusterGl from './cluster-gl'
import Cluster from '../cluster/cluster'
import ClusterNode from '../cluster/cluster-node'
import ClusterLink from '../cluster/cluster-link'
import { generate } from '../data-generator'
import {cluster} from './my-data'
import { Vector2D } from 'simple-gl'

export default class App extends React.Component<{},{}> {

    clusters: Array<Cluster>
  
    componentWillMount(){
        this.clusters = cluster.map(c => Cluster.from(c, new Vector2D(-30,-30), 60, 60))
    //    window.onblur = () => this.cluster.pause()
    //     window.onfocus = () => {
    //         this.cluster.play()
    //        // this.cluster =Cluster.from(cluster[0], new Vector2D(-30,-30), 60, 60)
    //         this.setState({})
    //     }
       this.clusters = cluster.map((nodeTree) => {
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
            let wordsList = new Array<{word: string, count: number}>()
            nameSet.forEach((value, key) => wordsList.push({word: key, count: value}))
            let sortedWords = wordsList.sort((a, b) => b.count-a.count)
            let cluster =  Cluster.from(nodeTree, new Vector2D(-30,-30), 60, 60)
            cluster.name = `${sortedWords[0].word} ${sortedWords[1].word} ${sortedWords[2].word}`
            return cluster
        })
    }

    wordsFrom(node:any): Array<string>{
        let title:string = node.info.title
        return title.split('-')
    }
    
    render(){
        return <ClusterGl clusters={this.clusters}/>
    }
}