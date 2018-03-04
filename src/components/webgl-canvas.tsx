import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { Vertex, webGlContextFrom, GLObject, GLScene, GLProgram, aspect, Vector2D } from 'simple-gl';

export interface WebGLCanvasProps {
    width: number;
    height: number;
    vertexShaderSource: string;
    fragmentShaderSource: string;
    objects: GLObject[];
    uniforms: Map<string, any>;
}

class WebGLCanvas extends React.Component<WebGLCanvasProps> {

    program: GLProgram;
    scene: GLScene;

    componentDidMount() {
        const canvas = findDOMNode(this) as HTMLCanvasElement;
        this.program = new GLProgram(
            webGlContextFrom(canvas),
            this.props.vertexShaderSource,
            this.props.fragmentShaderSource, 
            Vertex.attributeMappings(),
            this.props.uniforms
        );
        this.program.updateUniform(
            'projectionMatrix', 
            aspect(60, this.props.width, this.props.height)
        );
        this.scene = new GLScene(this.props.objects);
        this.renderLoop();
    }

    renderLoop(time: number = 0) {
        this.program.stageProgram();
        this.program.clear(0, 0, 0, 0.1);
        this.scene.render(this.program);
        this.scene.objects.forEach(
            (object: GLObject) => {
                object.transform = object.transform.translate(new Vector2D(0.1,0))
            }
        );
        requestAnimationFrame(this.renderLoop.bind(this));
    }

    render() { return <canvas width={this.props.width} height={this.props.height} />; }
}

export default WebGLCanvas;
