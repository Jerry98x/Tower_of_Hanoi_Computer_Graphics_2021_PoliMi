#version 300 es

in vec3 inPosition;
in vec3 inNormal;
in vec2 a_uv;

out vec3 fsNormal;
out vec3 fsPos;
out vec2 uvCoordinate;

uniform mat4 matrix; 
uniform mat4 nMatrix;
uniform mat4 pMatrix;

void main() {
    uvCoordinate = a_uv;
    fsNormal = mat3(nMatrix) * inNormal; 
    fsPos = (pMatrix * vec4(inPosition, 1.0)).xyz;
    gl_Position = matrix * vec4(inPosition, 1.0);
}