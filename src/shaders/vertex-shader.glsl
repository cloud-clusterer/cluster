attribute vec4 vertex_position;
attribute vec4 vertex_color;
varying vec4 pixelColor;
uniform mat4 projectionMatrix;

void main() {
    pixelColor = vertex_color;
    gl_Position = projectionMatrix * vertex_position;
}