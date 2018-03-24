import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { Vertex, Matrix3, webGlContextFrom, GLObject, GLScene, GLProgram, Matrix4, Transform3D, Vector2D, Vector3D } from 'simple-gl';

export interface WebGLCanvasProps {
    programs: Map<string, { vertexShaderSource: string, fragmentShaderSource: string, uniforms: Map<string, any> }>;
    scenes: Map<string, GLScene>;
    renderConfig: Array<{scene: string, program: string, clear: Boolean, clearColor: {r: number, g: number, b: number, a: number}}>;
    camera: Transform3D
    update: (time: number) => void;
    onMouseMove: (location: Vector2D) => void
    onMouseDown: (location: Vector2D) => void
    onMouseUp: (location: Vector2D) => void
    onWheel: (delta: Vector3D) => void
    viewUpdated: (programs: Map<string, GLProgram>, view: Matrix4, width:number, height:number) => void
}

class WebGLCanvas extends React.Component<WebGLCanvasProps> {
    programs: Map<string,GLProgram>
    private lastTime: number = 0
    aspectMatrix: Matrix4
    inverseView: Matrix4
    context2D: CanvasRenderingContext2D

    componentDidMount() {
        const canvas = findDOMNode(this) as HTMLCanvasElement;
        let programs = new Map<string, GLProgram>();
        let webglContext = webGlContextFrom(canvas)
        this.props.programs.forEach(
            (value, key) => {
                programs.set(
                    key,
                    new GLProgram(
                        webglContext,
                        value.vertexShaderSource,
                        value.fragmentShaderSource, 
                        Vertex.attributeMappings(),
                        value.uniforms
                    )
                )
            }
        );
        this.context2D = canvas.getContext('2d');
        this.programs = programs;
        this.renderLoop();
    }

    updateView(){
        var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        const canvas = findDOMNode(this) as HTMLCanvasElement;
        canvas.width = canvas.parentElement.clientWidth
        canvas.height = h-10
        this.aspectMatrix = this.props.camera.transform().multiply(Matrix4.aspect(1.2, canvas.width, canvas.height))
        this.inverseView = this.aspectMatrix.inverse()
        this.props.viewUpdated(this.programs, this.aspectMatrix, canvas.width, canvas.height)
    }

    mouseLocationFrom(event: MouseEvent): Vector2D{
        const canvas = findDOMNode(this) as HTMLCanvasElement;
        let cursor = new Vector3D(((2*event.clientX)/canvas.width)-1, -(((2*event.clientY)/canvas.height)-1), 0)
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

    onWheel(event: WheelEvent){
        this.props.onWheel(new Vector3D(event.deltaX, event.deltaY, event.deltaZ))
    }

    renderLoop(time: number = 0) {

        this.updateView()
        let delta = (time - this.lastTime) * 0.001
        
        this.lastTime = time
        this.props.update(delta)
        this.props.renderConfig.forEach(
            (renderConfig) => {
                let program = this.programs.get(renderConfig.program)
                program.stageProgram()
                if(renderConfig.clear) program.clear(renderConfig.clearColor.r, renderConfig.clearColor.g, renderConfig.clearColor.b, renderConfig.clearColor.a)
                this.props.scenes.get(renderConfig.scene).render(program);
            }
        )
        requestAnimationFrame(this.renderLoop.bind(this));
    }

    render() { 
        return <canvas
            onMouseMove={this.onMouseMove.bind(this)}
            onMouseDown={this.onMouseDown.bind(this)}
            onMouseUp={this.onMouseUp.bind(this)}
            onWheel={this.onWheel.bind(this)}
        />; }
}

export default WebGLCanvas;
