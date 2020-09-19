attribute vec4 a_position;
attribute vec2 a_texCoord;
attribute vec3 a_normal;

varying vec3 v_normal;
varying vec2 v_uv;
varying vec4 v_position;

void main(){
    gl_Position = CC_MVPMatrix * a_position;

    v_position = a_position;
    v_normal = CC_NormalMatrix * a_normal;
    v_uv = a_texCoord;
    v_uv.y = (1.0 - v_uv.y);
}