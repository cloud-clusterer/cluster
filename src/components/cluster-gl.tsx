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

    sliderChanged(event: any){
        let slider = event.target
        this.setState({scale: slider.value/100})
    }
    slider2Changed(event: any){
        let slider = event.target
        this.props.cluster.springiness = slider.value/1000
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
                (key: string) => <div>{`${key}: ${node.info.otherProperties[key]}`}</div>
            )
            return <div>
                <div>{node.name}</div>
                <div>{node.info.type}</div>
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
                    <input type="range" min="1" max="25" className="slider" onChange={this.sliderChanged.bind(this)}/>
                    <input type="range" min="1" max="25" className="slider" onChange={this.slider2Changed.bind(this)}/>
                    { this.nodeInfo() }
                </div>
        </div>
    }
}