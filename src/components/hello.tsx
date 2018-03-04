import * as React from "react";
import {Component} from "react";
import { Vector2D } from "simple-gl";
const vertexShaderSource = require('../shaders/vertex-shader.glsl');

export interface HelloProps { compiler: string; framework: string; }

export default class Hello extends Component<{},{}>{
    render(){
        return (
            <div>
                {new Vector2D(9,2).translate(new Vector2D(-5,0)).x}
            </div>
        )
    }
}