import * as React from 'react';
import WebGLCanvas from './webgl-canvas'
import { GLPolygon, Vector2D } from 'simple-gl';

const vertexShaderSource = require('../shaders/vertex-shader.glsl');
const fragmentShaderSource = require('../shaders/fragment-shader.glsl');

export default class App extends React.Component<{},{}> {

    uniforms: Map<string, {mapper:(gl: WebGLRenderingContext, position: WebGLUniformLocation, data: any)=>void}> = new Map()

    componentWillMount(){
        this.uniforms.set("projectionMatrix", {mapper:(gl:WebGLRenderingContext, position: WebGLUniformLocation, data: any)=> gl.uniformMatrix4fv(position, false, new Float32Array(data))})
    }

    render(){

        return <div>
            <WebGLCanvas
            width={1000}
            height={500}
            vertexShaderSource={vertexShaderSource}
            fragmentShaderSource={fragmentShaderSource}
            uniforms={this.uniforms}
            objects={[new GLPolygon(6, 2, new Vector2D(0,0))]}
            />
        </div>
    }
}