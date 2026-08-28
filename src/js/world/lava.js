import * as THREE from 'three'
import Experience from '../experience.js'

export default class Lava {
  constructor() {
    
    this.experience = new Experience()

    
    this.scene = this.experience.scene
    this.time = this.experience.time
    this.debug = this.experience.debug
    this.sizes = this.experience.sizes
    this.resources = this.experience.resources

    
    this.uniforms = {
      iTime: { value: 0.0 },
      iResolution: { value: new THREE.Vector2(this.sizes.width, this.sizes.height) },
      distanceFactor: { value: 0.24 },
      distanceFactorMin: { value: 0.2 },
      distanceFactorMax: { value: 0.30 },
      distanceFactorSpeed: { value: 0.5 },
      color1: { value: new THREE.Color('#e94909') },
      color2: { value: new THREE.Color('#4cff05') },
      glowColor: { value: new THREE.Color('#ee0000') },
      glowWidth: { value: 0.10 },
      glowSoftness: { value: 0.10 },
      pixelSize: { value: 48.0 },
      flowMap: { value: this.resources.items.flowMapTexture },
      flowSpeed: { value: 0.002 },
    }

    
    this.createShaderMaterial()

    
    this.createLavaMesh()

    
    if (this.debug.active) {
      this.debugObject = {
        positionX: -40.0,
        positionY: 0.59,
        positionZ: -1.8,
        scale: 10,
        color1: '#e94909',
        color2: '#4cff05',
        glowColor: '#ee0000',
        flowSpeed: 0.005,
      }
      this.debugInit()
    }
  }

  createShaderMaterial() {
    
    this.vertexShader = /* glsl */ `
      uniform float iTime;
      varying vec2 vUv;
      void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `

    
    this.fragmentShader = /* glsl */ `
      uniform vec2 iResolution;
      uniform float iTime;
      uniform float distanceFactor;
      uniform vec3 color1;
      uniform vec3 color2;
      uniform vec3 glowColor;
      uniform float glowWidth;
      uniform float glowSoftness;
      uniform float pixelSize;
      uniform sampler2D flowMap;
      uniform float flowSpeed;

      varying vec2 vUv;

      vec2 getPoint(int index) {
        vec2 baseVec = vec2(sin(float(index)), cos(float(index)));
        return sin(iTime * 0.5 + baseVec * 6.28) * 0.5 + 0.5;
      }

      void main() {
        
        vec2 flow = texture2D(flowMap, vUv).rg * 2.0 - 1.0;
        
        
        vec2 flowOffset = flow * flowSpeed * sin(iTime * 0.5)*1.0;
        
        
        vec2 uv = vUv + flowOffset;

        
        vec2 pixels = vec2(pixelSize);
        uv = floor(uv * pixels) / pixels;

        
        uv *= 8.0;
        vec2 uv_i = floor(uv);

        float m_dist = 2.0;

        for (int y= -1; y <= 1; y++) {
          for (int x= -1; x <= 1; x++) {
            float index_f = uv_i.x + uv_i.y * 10.0 + float(x) + float(y) * 10.0;
            index_f = mod(index_f + 100.0, 100.0);
            int index = int(index_f);
            vec2 point = getPoint(index);
            point = point + vec2(float(x), float(y)) + uv_i;
            float dist = distance(uv, point) * distanceFactor;
            m_dist = min(m_dist, dist);
          }
        }

        float factor = smoothstep(0.05, 0.4, m_dist);
        vec3 lavaColor = mix(color1, color2, factor);

        
        float distToEdgeX = min(vUv.x, 1.0 - vUv.x);
        float distToEdgeY = min(vUv.y, 1.0 - vUv.y);
        float minDistToEdge = min(distToEdgeX, distToEdgeY);

        float glowFactor = 1.0 - smoothstep(glowWidth - glowSoftness, glowWidth, minDistToEdge);
        glowFactor = clamp(glowFactor, 0.0, 1.0);

        vec3 finalColor = mix(lavaColor, glowColor, glowFactor);
        gl_FragColor = vec4(finalColor, 0.7);
      }
    `

    
    this.shaderMaterial = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      side: THREE.DoubleSide,
      transparent: true,
      depthTest: true,
      depthWrite: false,
    })
  }

  createLavaMesh() {
    
    const geometry = new THREE.PlaneGeometry(10, 12.5, 1, 1)
    this.lavaMesh = new THREE.Mesh(geometry, this.shaderMaterial)

    
    this.lavaMesh.rotation.x = -Math.PI / 2 
    this.lavaMesh.position.set(-40.0, 0.59, -1.8) 

    
    this.scene.add(this.lavaMesh)
  }

  update() {
    
    if (this.uniforms && this.uniforms.iTime) {
      this.uniforms.iTime.value = this.time.elapsed * 0.001

      
      const time = this.time.elapsed * 0.001
      const min = this.uniforms.distanceFactorMin.value
      const max = this.uniforms.distanceFactorMax.value
      const speed = this.uniforms.distanceFactorSpeed.value

      
      this.uniforms.distanceFactor.value
        = min + (Math.sin(time * speed) * 0.5 + 0.5) * (max - min)
    }
  }

  resize() {
    
    if (this.uniforms && this.uniforms.iResolution) {
      this.uniforms.iResolution.value.set(this.sizes.width, this.sizes.height)
    }
  }

  debugInit() {
    
    this.debugFolder = this.debug.ui.addFolder({
      title: 'Lava Effect',
      expanded: false,
    })

    
    const lavaFolder = this.debugFolder.addFolder({
      title: 'Lava Parameters',
      expanded: false,
    })

    
    lavaFolder.addBinding(
      this.uniforms.flowSpeed,
      'value',
      {
        label: 'Flow Speed',
        min: 0,
        max: 0.2,
        step: 0.001,
      },
    )

    
    const positionFolder = lavaFolder.addFolder({
      title: 'Position Control',
      expanded: false,
    })

    
    positionFolder.addBinding(
      this.debugObject,
      'positionX',
      {
        label: 'X-Axis Position',
        min: -100,
        max: 100,
        step: 0.1,
      },
    ).on('change', () => {
      this.lavaMesh.position.x = this.debugObject.positionX
    })

    
    positionFolder.addBinding(
      this.debugObject,
      'positionY',
      {
        label: 'Y-Axis Position',
        min: -5,
        max: 5,
        step: 0.01,
      },
    ).on('change', () => {
      this.lavaMesh.position.y = this.debugObject.positionY
    })

    
    positionFolder.addBinding(
      this.debugObject,
      'positionZ',
      {
        label: 'Z-Axis Position',
        min: -100,
        max: 100,
        step: 0.1,
      },
    ).on('change', () => {
      this.lavaMesh.position.z = this.debugObject.positionZ
    })

    
    lavaFolder.addBinding(
      this.debugObject,
      'scale',
      {
        label: 'Lava Surface Size',
        min: 1,
        max: 50,
        step: 1,
      },
    ).on('change', () => {
      this.lavaMesh.scale.set(
        this.debugObject.scale / 50,
        this.debugObject.scale / 50,
        1,
      )
    })

    lavaFolder.addBinding(
      this.uniforms.distanceFactor,
      'value',
      {
        label: 'Ripple Strength',
        min: 0.1,
        max: 1.0,
        step: 0.01,
      },
    ).on('change', () => {
      this.uniforms.distanceFactor.value = this.debugObject.distanceFactor
    })

    lavaFolder.addBinding(
      this.debugObject,
      'color1',
      {
        label: 'Lava Color 1',
        view: 'color',
      },
    ).on('change', () => {
      this.uniforms.color1.value.set(this.debugObject.color1)
    })

    lavaFolder.addBinding(
      this.debugObject,
      'color2',
      {
        label: 'Lava Color 2',
        view: 'color',
      },
    ).on('change', () => {
      this.uniforms.color2.value.set(this.debugObject.color2)
    })

    
    const glowFolder = this.debugFolder.addFolder({
      title: 'Glow Parameters',
      expanded: true,
    })

    
    const pixelFolder = this.debugFolder.addFolder({
      title: 'Pixelation Parameters',
      expanded: true,
    })

    pixelFolder.addBinding(
      this.uniforms.pixelSize,
      'value',
      {
        label: 'Pixelation Degree',
        min: 8,
        max: 64,
        step: 1,
      },
    )

    glowFolder.addBinding(
      this.debugObject,
      'glowColor',
      {
        label: 'Glow Color',
        view: 'color',
      },
    ).on('change', () => {
      this.uniforms.glowColor.value.set(this.debugObject.glowColor)
    })

    glowFolder.addBinding(
      this.uniforms.glowWidth,
      'value',
      {
        label: 'Glow Width',
        min: 0,
        max: 0.2,
        step: 0.005,
      },
    )

    glowFolder.addBinding(
      this.uniforms.glowSoftness,
      'value',
      {
        label: 'Glow Softness',
        min: 0,
        max: 0.1,
        step: 0.001,
      },
    )
  }
}

// Updated on 2026-08-28
 