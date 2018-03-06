import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { Vertex, Matrix3, webGlContextFrom, GLObject, GLScene, GLProgram, Vector2D } from 'simple-gl';

export interface WebGLCanvasProps {
    vertexShaderSource: string;
    fragmentShaderSource: string;
    objects: Array<any>;
    uniforms: Map<string, any>;
    update: (time: number) => void;
    scale: number;
    onMouseMove: (location: Vector2D) => void
    onMouseDown: (location: Vector2D) => void
    onMouseUp: (location: Vector2D) => void
}

class WebGLCanvas extends React.Component<WebGLCanvasProps> {

    program: GLProgram
    scene: GLScene
    private lastTime: number = 0
    private scale: number = 0.5
    aspectMatrix: Matrix3
    inverseView: Matrix3

    componentDidMount() {
        const canvas = findDOMNode(this) as HTMLCanvasElement;
        this.program = new GLProgram(
            webGlContextFrom(canvas),
            this.props.vertexShaderSource,
            this.props.fragmentShaderSource, 
            Vertex.attributeMappings(),
            this.props.uniforms
        );
    
        this.scene = new GLScene(this.props.objects);
        this.renderLoop();
    }

    updateView(){
        const canvas = findDOMNode(this) as HTMLCanvasElement;
        canvas.width = canvas.parentElement.clientWidth
        canvas.height = canvas.parentElement.clientHeight
        this.aspectMatrix = Matrix3.scale(new Vector2D(this.props.scale, this.props.scale)).multiply(Matrix3.aspect(1.2, canvas.width, canvas.height))
        this.program.updateUniform('projectionMatrix', this.aspectMatrix.matrix4Floats())
        this.inverseView = this.aspectMatrix.inverse()
    }

    mouseLocationFrom(event: MouseEvent): Vector2D{
        const canvas = findDOMNode(this) as HTMLCanvasElement;
        let cursor = new Vector2D(((2*event.clientX+30)/canvas.width)-1, -((2*event.clientY/canvas.height)-1))
        return this.inverseView.transform(cursor)
    }

    onMouseDown(event: MouseEvent){
        this.props.onMouseDown(this.mouseLocationFrom(event))
    }

    onMouseUp(event: MouseEvent){
        this.props.onMouseUp(this.mouseLocationFrom(event))
    }

    onMouseMove(event: MouseEvent){
        this.props.onMouseMove(this.mouseLocationFrom(event))
    }

    renderLoop(time: number = 0) {
        
        this.updateView()
        let delta = (time - this.lastTime) * 0.001
        
        this.lastTime = time
        this.props.update(delta)
        this.program.stageProgram();
        this.program.clear(0,0,0,0.02);
        this.scene.render(this.program);
        requestAnimationFrame(this.renderLoop.bind(this));
    }

    render() { return <canvas 
        onMouseMove={this.onMouseMove.bind(this)}
        onMouseDown={this.onMouseDown.bind(this)}
        onMouseUp={this.onMouseUp.bind(this)}
        />; }
}

export default WebGLCanvas;
