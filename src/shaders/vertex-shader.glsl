attribute vec4 vertex_position;
attribute vec4 vertex_color;
varying vec4 pixelColor;
uniform mat4 projectionMatrix;
uniform vec2 cursor_location;

void main() {
    vec4 pos = projectionMatrix * vertex_position * vec4(1,1,0.001, 1.0+vertex_position.z*0.01);
    pixelColor = vertex_color;
    gl_Position = pos;
}