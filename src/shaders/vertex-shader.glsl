attribute vec4 vertex_position;
attribute vec4 vertex_color;
varying vec4 pixelColor;
uniform mat4 projectionMatrix;
uniform vec2 cursor_location;

void main() {
    vec4 pos = projectionMatrix * vertex_position;
    pixelColor = vertex_color;
    gl_Position = pos;
}