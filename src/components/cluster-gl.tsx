import * as React from 'react'
import { Component } from 'react'
import WebGLCanvas from './webgl-canvas'
import { GLScene, GLPolygon, Vector2D, GLObject, Matrix3, GLProgram } from 'simple-gl'
import Cluster from '../cluster/cluster'
import ClusterNode from '../cluster/cluster-node'

const vertexShaderSource = require('../shaders/vertex-shader.glsl');
const fragmentShaderSource = require('../shaders/fragment-shader.glsl');

export interface ClusterGLProps{
    cluster: Cluster
}

export default class ClusterGl extends Component<ClusterGLProps,{scale: number, selectedNode: ClusterNode}>{

    programs: Map<string, {vertexShaderSource: string, fragmentShaderSource: string, uniforms:Map<string, any>}>
    nodes: Array<GLObject>
    links: Array<GLObject>
    componentWillMount(){
        this.setState({scale: 0.1})
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
        this.nodes = [this.props.cluster.nodes[0]]
        this.links = this.props.cluster.links
    }

    viewUpdated(programs: Map<string, GLProgram>, view: Matrix3){
        programs.get("main").updateUniform('projectionMatrix', view.matrix4Floats())
    }

    scenes(): Map<string, GLScene>{
        let scenes = new Map<string, GLScene>()
        scenes.set("cluster", new GLScene([...this.links, ...this.nodes]))
        return scenes
    }

    renderConfig(){
        return [
            { scene:"cluster", program: "main", clear: true, clearColor: { r:0, g:0, b:0, a:0 } }
        ]
    }

    current: number = 0

    update(time: number){
        if(this.nodes.length<this.props.cluster.nodes.length && this.current>1){
            this.nodes.push(this.props.cluster.nodes[this.nodes.length])
            this.current = 0
        }
        this.current += time;
        this.props.cluster.update(time)
        if(this.props.cluster.highlightedNode && this.props.cluster.highlightedNode != this.state.selectedNode){
            this.setState({selectedNode: this.props.cluster.highlightedNode})
        }
        else{
            this.setState({})
        }
    }

    onMouseDown(location: Vector2D){
        this.props.cluster.onMouseDown(location)
    }

    onMouseUp(location: Vector2D){
        this.props.cluster.onMouseUp(location)
    }

    onMouseMove(location: Vector2D){
        this.props.cluster.onMouseMove(location)
    }

    nodeInfo(): JSX.Element {
        let node = this.state.selectedNode
        if(node){
            let otherProperties = Object.keys(node.info.otherProperties).map(
                (key: string) => <div className="row"><div className="col-3">{`${key}:`}</div><div className="col-9">{`${node.info.otherProperties[key]}`}</div></div>
            )
            return <div>
                <h2 style={{textAlign: 'center'}}>{node.info.title}</h2>
                <div className="row">
                    <div className="col-3">Name:</div><div className="col-9">{node.name}</div>
                    <div className="col-3">Type:</div><div className="col-9">{node.info.type}</div>
                </div>
                <h4 style={{textAlign: 'center', marginTop: '0.5em'}}> Properties </h4>
                {otherProperties}
            </div>
        }
        return <p></p>
    }


    render(){

        return <div className="row" style={{margin: "0px"}}>
                <div className="col-9" style={{margin: "0px", padding: "0px", display:'block', height: '100%'}}>
                    <WebGLCanvas
                        programs={this.programs}
                        scenes={this.scenes()}
                        renderConfig={this.renderConfig()}
                        update ={this.update.bind(this)}
                        scale ={this.state.scale}
                        onMouseMove = {this.onMouseMove.bind(this)}
                        onMouseDown = {this.onMouseDown.bind(this)}
                        onMouseUp = {this.onMouseUp.bind(this)}
                        viewUpdated = {this.viewUpdated.bind(this)}
                    />
                </div>
                <div className="col-3">
                   { this.nodeInfo() }
                </div>
        </div>
    }
}