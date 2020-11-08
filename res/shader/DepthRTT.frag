uniform float u_farPlane;
uniform vec4 u_color;

void main(){
	gl_FragColor = vec4(vec3(gl_FragCoord.z/u_farPlane), 1.0) * u_color;
}