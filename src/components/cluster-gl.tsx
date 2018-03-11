import * as React from 'react'
import { Component } from 'react'
import WebGLCanvas from './webgl-canvas'
import { GLPolygon, Vector2D, GLObject } from 'simple-gl'
import Cluster from '../cluster/cluster'
import ClusterNode from '../cluster/cluster-node'

const vertexShaderSource = require('../shaders/vertex-shader.glsl');
const fragmentShaderSource = require('../shaders/fragment-shader.glsl');

export interface ClusterGLProps{
    cluster: Cluster
}

export default class ClusterGl extends Component<ClusterGLProps,{scale: number, selectedNode: ClusterNode}>{

    uniforms: Map<string, {mapper:(gl: WebGLRenderingContext, position: WebGLUniformLocation, data: any)=>void}> = new Map()

    componentWillMount(){
        this.setState({scale: 0.1})
        this.uniforms.set("projectionMatrix", {mapper:(gl:WebGLRenderingContext, position: WebGLUniformLocation, data: any)=> gl.uniformMatrix4fv(position, false, new Float32Array(data))})
        this.uniforms.set("cursor_location", {mapper: (gl:WebGLRenderingContext, position: WebGLUniformLocation, data: any)=>gl.uniform2fv(position, new Float32Array(data))})
    }

    update(time: number){
        this.props.cluster.update(time)
        if(this.props.cluster.highlightedNode && this.props.cluster.highlightedNode != this.state.selectedNode){
            this.setState({selectedNode: this.props.cluster.highlightedNode})
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
                    vertexShaderSource={vertexShaderSource}
                    fragmentShaderSource={fragmentShaderSource}
                    uniforms={this.uniforms}
                    objects={[...this.props.cluster.links, ...this.props.cluster.nodes]}
                    update ={this.update.bind(this)}
                    scale ={this.state.scale}
                    onMouseMove = {this.onMouseMove.bind(this)}
                    onMouseDown = {this.onMouseDown.bind(this)}
                    onMouseUp = {this.onMouseUp.bind(this)}
                    />
                </div>
                <div className="col-3">
                   { this.nodeInfo() }
                </div>
        </div>
    }
}