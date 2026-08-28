uniform vec3 uOutlineColor;    
uniform float uTime;           
uniform float uOpacity;        
uniform float uBreathingSpeed; 
uniform float uBreathingMin;   
uniform float uBreathingRange; 
varying float vTimeOffset;     

void main() {
    
    
    float breathing = uBreathingMin + uBreathingRange * sin((uTime + vTimeOffset) * uBreathingSpeed);
    
    
    gl_FragColor = vec4(uOutlineColor, uOpacity * breathing);
} 
// Updated on 2026-08-28
 