uniform float uOutlineThickness; 
uniform float uTimeOffset;    
varying float vTimeOffset;    

void main() {
    
    vec3 boostedPosition = position + normal * uOutlineThickness;
    
    
    vTimeOffset = uTimeOffset;
    
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(boostedPosition, 1.0);
} 
// Updated on 2026-08-28
