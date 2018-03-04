import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { Vertex, webGlContextFrom, GLObject, GLScene, GLProgram, aspect, Vector2D } from 'simple-gl';

export interface WebGLCanvasProps {
    width: number;
    height: number;
    vertexShaderSource: string;
    fragmentShaderSource: string;
    objects: Array<any>;
    uniforms: Map<string, any>;
    update: (time: number) => void;
}

class WebGLCanvas extends React.Component<WebGLCanvasProps> {

    program: GLProgram;
    scene: GLScene;
    private lastTime: number = 0;

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
        let delta = (time - this.lastTime) * 0.001
        this.lastTime = time
        this.props.update(delta)
        this.program.stageProgram();
        this.program.clear(0, 0, 0, 0.1);
        this.scene.render(this.program);
        requestAnimationFrame(this.renderLoop.bind(this));
    }

    render() { return <canvas width={this.props.width} height={this.props.height} />; }
}

export default WebGLCanvas;
