attribute vec4 a_position;
attribute vec3 a_normal;
attribute vec3 a_tangent;
attribute vec3 a_binormal;
attribute vec2 a_texCoord;

varying vec3 v_normal;
varying vec2 v_uv;
varying vec4 v_world_position;
varying vec3 v_tangent;
varying vec3 v_binormal;

void main(){
    gl_Position = CC_MVPMatrix * a_position;

    v_world_position = CC_MVMatrix * a_position;
    v_normal = normalize(CC_NormalMatrix * a_normal);
    v_uv = a_texCoord;
    v_uv.y = (1.0 - v_uv.y);

    v_tangent = normalize(CC_NormalMatrix * a_tangent);
    v_binormal = normalize(CC_NormalMatrix * a_binormal);
}