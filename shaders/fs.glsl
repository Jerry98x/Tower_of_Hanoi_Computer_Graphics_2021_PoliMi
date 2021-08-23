#version 300 es

precision mediump float;

in vec3 fsPos;
in vec3 fsNormal;
in vec2 uvCoordinate;

out vec4 outColor;

uniform sampler2D sampler;

uniform vec3 mDiffColor; //material diffuse color

// uniform vec3 lightDirection; // directional light direction vec
// uniform vec3 lightColor; //directional light color 

uniform vec3 LAlightColor; //point light color 
uniform vec3 LAPos; //point light position
uniform float LATarget; //point light target
uniform float LADecay; //point light decay

void main() {

  vec3 nNormal = normalize(0.0-fsNormal);

  vec3 textureCol = texture(sampler, uvCoordinate).rgb;

  //vec3 nEyeDirection = normalize(-fsPos); //direct
  //vec3 nLightDirection = normalize(-lightDirection);  //direct

  vec3 lightColorPoint = LAlightColor * pow(LATarget / length(LAPos - fsPos), LADecay);  //point
  vec3 lightDirNorm = normalize(LAPos - fsPos);    //point


  vec3 diffColor = mDiffColor * 0.1 + textureCol * 0.9;

  //vec3 lambertColor = mDiffColor * lightColorPoint * dot(-lightDirNorm, nNormal);
  vec3 lambertColor = clamp(dot(-lightDirNorm, nNormal), 0.0, 1.0) * diffColor * lightColorPoint;
  outColor = vec4(clamp(lambertColor, 0.00, 1.0), 1.0);
}