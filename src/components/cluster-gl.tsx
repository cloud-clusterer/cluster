import * as React from 'react'
import { Component } from 'react'
import WebGLCanvas from './webgl-canvas'
import { GLPolygon, Vector2D } from 'simple-gl'
import Cluster from '../cluster/cluster'

const vertexShaderSource = require('../shaders/vertex-shader.glsl');
const fragmentShaderSource = require('../shaders/fragment-shader.glsl');

export interface ClusterGLProps{
    cluster: Cluster
}

export default class ClusterGl extends Component<ClusterGLProps>{

    uniforms: Map<string, {mapper:(gl: WebGLRenderingContext, position: WebGLUniformLocation, data: any)=>void}> = new Map()

    componentWillMount(){
        this.uniforms.set("projectionMatrix", {mapper:(gl:WebGLRenderingContext, position: WebGLUniformLocation, data: any)=> gl.uniformMatrix4fv(position, false, new Float32Array(data))})
    }

    update(time: number){
        this.props.cluster.update(time)
    }

    render(){

        return <div>
            <WebGLCanvas
            width={1000}
            height={500}
            vertexShaderSource={vertexShaderSource}
            fragmentShaderSource={fragmentShaderSource}
            uniforms={this.uniforms}
            objects={this.props.cluster.nodes}
            update ={this.update.bind(this)}
            />
        </div>
    }
}