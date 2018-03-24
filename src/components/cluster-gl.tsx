import * as React from 'react'
import { Component } from 'react'
import WebGLCanvas from './webgl-canvas'
import { GLScene, GLPolygon, Vector2D, Vector3D, GLObject, Matrix4, GLProgram, Transform3D } from 'simple-gl'
import Cluster from '../cluster/cluster'
import ClusterNode from '../cluster/cluster-node'
import './cluster-gl-style.css'

const vertexShaderSource = require('../shaders/vertex-shader.glsl');
const fragmentShaderSource = require('../shaders/fragment-shader.glsl');

export interface ClusterGLProps{
    clusters: Array<Cluster>
}

export interface ClusterGLState{
    scale: number
    selectedNode: ClusterNode
    camera: Transform3D
}

function toList<T>(set: Set<T>): Array<T>{
 let array = new Array<T>()
    set.forEach(item=>array.push(item))
 return array
}

export default class ClusterGl extends Component<ClusterGLProps,ClusterGLState>{

    programs: Map<string, {vertexShaderSource: string, fragmentShaderSource: string, uniforms:Map<string, any>}>
    screenNodes: Array<{node: ClusterNode, position: Vector2D}> = []
    typeFilters: Set<string> = new Set()
    nameFilters: Set<string> = new Set()
    activeCluster: Cluster

    componentWillMount(){
        const camera = new Transform3D()
        camera.scale(new Vector3D(0.05,0.05,1))
        this.setState({camera: camera})
        let uniforms = new Map<string, any>()
        uniforms.set("projectionMatrix", {mapper:(gl:WebGLRenderingContext, position: WebGLUniformLocation, data: any)=> gl.uniformMatrix4fv(position, false, new Float32Array(data))})
        uniforms.set("cursor_location", {mapper: (gl:WebGLRenderingContext, position: WebGLUniformLocation, data: any)=>gl.uniform2fv(position, new Float32Array(data))})
        let programs = new Map()
        programs.set("main", { 
            vertexShaderSource: vertexShaderSource,
            fragmentShaderSource: fragmentShaderSource, 
            uniforms: uniforms
        });
        this.programs = programs
        this.activeCluster = this.props.clusters[0]
    }

    viewUpdated(programs: Map<string, GLProgram>, view: Matrix4, width: number, height: number){
        programs.get("main").updateUniform('projectionMatrix', view.transpose().floats())
        this.screenNodes = this.activeCluster.transformedPositions.map(({node, position}) => {
            return {node: node, position: this.screenPositionFor(position, view, width, height)}
        })
    }

    screenPositionFor(position: Vector3D, view: Matrix4, width: number, height: number): Vector2D{
        let transformed = view.transform(new Vector3D(position.x, position.y, 0))

        return transformed.scaleV(new Vector3D(width/2, -height/2, 1)).translate(new Vector3D(width/2, height/2, 0))
    }

    scenes(): Map<string, GLScene>{
        let scenes = new Map<string, GLScene>()
        let nodes = this.activeCluster.nodes.filter((node) => !node.disabled)
        let links = this.activeCluster.links.filter((link) => !link.disabled)
        scenes.set("cluster", new GLScene([...links, ...nodes]))
        return scenes
    }

    renderConfig(){
        return [
            { scene:"cluster", program: "main", clear: true, clearColor: { r:248/255, g:248/255, b:250/255, a:1 } }
        ]
    }

    update(time: number){
        this.activeCluster.update(time)
        if(this.activeCluster.highlightedNode && this.activeCluster.highlightedNode != this.state.selectedNode){
            this.setState({selectedNode: this.activeCluster.highlightedNode})
        }
        else{
           this.setState({})
        }
    }

    onMouseDown(location: Vector2D){
        this.activeCluster.onMouseDown(location)
    }

    onMouseUp(location: Vector2D){
        this.activeCluster.onMouseUp(location)
    }

    onMouseMove(location: Vector2D){
        this.activeCluster.onMouseMove(location)
    }

    onWheel(delta: Vector3D){
        this.state.camera.translate(new Vector3D(0, delta.y*0.001,0))
        //this.state.camera.scale(new Vector3D(1 + delta.y*0.001, 1 + delta.y*0.001, 1))
    }

    filterChanged(){
        let disabled = (node: ClusterNode) => {
            let filtered = this.typeFilters.has(node.info.type)
            if(!filtered){
                this.nameFilters.forEach(
                    (filter) => {
                        if(node.name.indexOf(filter) != -1){
                            filtered = true
                        }
                    }
                )
            }
            return filtered
        }
        this.activeCluster.links.forEach((link)=>link.disabled = false)
        this.activeCluster.nodes.forEach((node) =>{
            node.disabled = disabled(node)
            if(node.disabled){
                this.activeCluster.links.forEach((link) => {
                    if(link.nodeA == node || link.nodeB == node){
                        link.disabled = true
                    }
                })
            }
        })
        this.setState({})
    }

    typeFilterClicked(type: string){
        if(this.typeFilters.has(type)){
            this.typeFilters.delete(type)
        }
        else{
            this.typeFilters.add(type)
        }
        this.filterChanged()
    }

    groupNameClicked(){
        let currentIndex = this.props.clusters.indexOf(this.activeCluster)
        if(currentIndex >= this.props.clusters.length-1){
            this.activeCluster = this.props.clusters[0]
        }
        else{
            this.activeCluster = this.props.clusters[currentIndex+1]
        }
        this.setState({})
    }

    filterKeyDown(event: KeyboardEvent){
        if(event.key == "Enter"){
            this.nameFilters.add((event.target as HTMLInputElement).value);
           (event.target as HTMLInputElement).value = ''
           this.filterChanged()
        }
    }

    nodeInfo(): JSX.Element{
        let node = this.state.selectedNode
        if(node){
            let otherProperties = Object.keys(node.info.otherProperties).map(
                (key: string) => <div className="row rowitem"><div className="col-3">{`${key}:`}</div><div className="col-9">{`${node.info.otherProperties[key]}`}</div></div>
            )
            return <div>
                <h2 style={{textAlign: 'center', wordWrap: 'break-word', padding:'1em', borderBottom:'1px solid #e4e4e4'}}>{node.info.title}</h2>
                <div className="row rowitem">
                    <div className="col-3">Name:</div><div className="col-9">{node.name}</div>
                </div>
                <div className="row rowitem">
                    <div className="col-3">Type:</div><div className="col-9">{node.info.type}</div>
                </div>
                { 
                    Object.keys(node.info.otherProperties).length > 0 ?(
                        <h4 style={{textAlign: 'center', marginTop: '0.5em'}}> Properties </h4>
                    ) : <div/>
                }
                {otherProperties}
            </div>
        }
        return <div></div>
    }

    panel(): JSX.Element {
        return <div>
            <div onClick={this.groupNameClicked.bind(this)} style={{textAlign: 'center', cursor:'pointer'}}>{this.activeCluster.name}</div>
            {this.nodeInfo()}
            <div>
                {this.nameFilters.size > 0?(
                    <div>
                        {toList(this.nameFilters).map((name)=>
                            <p>{name}</p>
                        )}
                    </div>
                ): <div/>}
            </div>
            <div style={{position:'absolute', bottom:'0px'}}>
                <input onKeyDown={this.filterKeyDown.bind(this)} type="text"/>
            </div>
        </div>
    }

    legend(){
        let svgWidth = 300;
        let svgHeight = 30*(this.activeCluster.types.size+1);
        let circles:JSX.Element[] = []
        let names: JSX.Element[] = []
        let currentPos = 0
        this.activeCluster.types.forEach((value, key) => {
            let fill = `rgb(${Math.floor(value.color.r*255)}, ${Math.floor(value.color.g*255)}, ${Math.floor(value.color.b*255)})`
            if(this.typeFilters.has(key)) fill = 'grey'
            circles.push(
                <circle cx={svgWidth-30} cy={currentPos*30 + 30} r={10} fill={fill}/>
            )
            names.push(<li><p onClick={()=>this.typeFilterClicked(key)} className='legendItem' style={{marginBottom:'6px'}}>{key}</p></li>);
            currentPos ++
        })
        return<div>
             <svg style={{position:'absolute', right:'0', bottom:'0', width:(svgWidth + 'px'), height:(svgHeight + 'px')}}>
                {circles}
            </svg>
            <div style={{position:'absolute', right:'0', bottom:'0', width:(svgWidth + 'px'), height:(svgHeight + 'px')}}>
                <ul style={{margin:'0', marginTop: '20px', listStyleType: 'none'}}>
                    {names}
                </ul>
            </div>
        </div>
    }

    text(){
        return this.screenNodes.map(({node, position}) => {
            return <p style={{position: 'absolute', top:(position.y-30), left:(position.x), fontSize:'10px', maxWidth:'15rem', maxHeight:'1.1rem', overflow:'hidden', textOverflow:'ellipsis'}}>{node.info.title}</p>
        })
    }

    render(){
        return <div className="row" style={{margin: "0px"}}>
                <div className="col-9" style={{margin: "0px", padding: "0px", display:'block', height: '100%'}}>
                    <WebGLCanvas
                        programs={this.programs}
                        scenes={this.scenes()}
                        renderConfig={this.renderConfig()}
                        update ={this.update.bind(this)}
                        camera ={this.state.camera}
                        onMouseMove = {this.onMouseMove.bind(this)}
                        onMouseDown = {this.onMouseDown.bind(this)}
                        onMouseUp = {this.onMouseUp.bind(this)}
                        onWheel = {this.onWheel.bind(this)}
                        viewUpdated = {this.viewUpdated.bind(this)}
                    />
                    {this.legend()}
                    <div style={{width:'100%', height:'100%', position:'absolute', top:'0', left:'0', bottom:'0', right:'0', pointerEvents:'none', overflow:'hidden'}}>
                        {this.text()}
                    </div>
                </div>
                <div className="col-3">
                   { this.panel() }
                </div>
        </div>
    }
}