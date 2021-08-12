#version 300 es

precision mediump float;

in vec3 fsPos;
in vec3 fsNormal;
in vec2 uvCoordinate;

out vec4 outColor;

uniform sampler2D sampler;

uniform vec3 mDiffColor; //material diffuse color 
uniform vec3 lightDirection; // directional light direction vec
uniform vec3 lightColor; //directional light color 

void main() {

  vec3 nNormal = normalize(0.0-fsNormal);

  vec3 nEyeDirection = normalize(-fsPos);
  vec3 nLightDirection = normalize(-lightDirection);

  vec3 lambertColor = mDiffColor * lightColor * dot(-lightDirection, nNormal);
  outColor = vec4(clamp(lambertColor, 0.00, 1.0),1.0);
}