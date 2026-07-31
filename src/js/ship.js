import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'

const init = () => {
  const canvas = document.querySelector('#canvas')
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  
  // Use a soft background color
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#8aa5b8')

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000)
  camera.position.set(0, 0, 500) // Will be updated when model loads

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.5)
  scene.add(ambientLight)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 2)
  directionalLight.position.set(1, 1, 1)
  scene.add(directionalLight)
  
  // Add another light to make sure all sides are well lit
  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight2.position.set(-1, -1, -1)
  scene.add(directionalLight2)

  let controls
  let phoenix
  let phoenixMixer
  let phoenix2
  let phoenixMixer2
  let pegasus
  let pegasusMixer
  const shipCenter = new THREE.Vector3()
  let isZoomComplete = false
  let heartTime = 0
  let moveSpeedScalar = 50
  let maxDim = 250

  // (Phoenix controls removed for automated movement)

  const loader = new GLTFLoader()
  const dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
  loader.setDRACOLoader(dracoLoader)
  loader.load('/models/ship_in_clouds.glb', (gltf) => {
    const model = gltf.scene
    scene.add(model)

    // Calculate bounding box of the entire model to figure out scale and center
    const box = new THREE.Box3().setFromObject(model)
    box.getCenter(shipCenter)
    const size = new THREE.Vector3()
    box.getSize(size)

    maxDim = Math.max(size.x, size.y, size.z)
    moveSpeedScalar = maxDim * 0.2
    
    // Position the camera far outside the sphere (approx 2x the maximum dimension)
    const startZ = shipCenter.z + maxDim * 2
    // End position inside the clouds closer to the ship (approx 0.25x the dimension)
    const endZ = shipCenter.z + maxDim * 0.25

    camera.position.set(shipCenter.x, shipCenter.y, startZ)
    camera.lookAt(shipCenter)

    const setupPhoenix = (modelScene, animations, isMirror) => {
      const p = modelScene
      
      const pBox = new THREE.Box3().setFromObject(p)
      const pSize = new THREE.Vector3()
      pBox.getSize(pSize)
      const pMaxDim = Math.max(pSize.x, pSize.y, pSize.z, 0.001)
      
      const targetSize = maxDim * 0.02
      const scale = targetSize / pMaxDim
      p.scale.set(scale, scale, scale)

      if (isZoomComplete) {
        p.position.copy(shipCenter).add(new THREE.Vector3(0, maxDim * 0.05, 0))
      } else {
        const xOffset = isMirror ? -maxDim * 0.05 : maxDim * 0.05
        p.position.set(shipCenter.x + xOffset, shipCenter.y - maxDim * 0.05, startZ - maxDim * 0.1)
      }
      
      p.rotation.order = 'YXZ'
      p.rotation.y = Math.PI / 2

      scene.add(p)

      let mixer = null
      if (animations && animations.length > 0) {
        mixer = new THREE.AnimationMixer(p)
        let targetAnimation = animations[0]
        for (const anim of animations) {
          const name = anim.name.toLowerCase()
          if (!name.includes('fall')) {
            targetAnimation = anim
            if (name.includes('fly') || name.includes('glide') || name.includes('take')) {
              break
            }
          }
        }
        mixer.clipAction(targetAnimation).play()
      }
      return { model: p, mixer }
    }

    loader.load('/models/phoenix_bird.glb', (gltf) => {
      const clonedScene = SkeletonUtils.clone(gltf.scene)
      
      const res1 = setupPhoenix(gltf.scene, gltf.animations, false)
      phoenix = res1.model
      phoenixMixer = res1.mixer

      const res2 = setupPhoenix(clonedScene, gltf.animations, true)
      phoenix2 = res2.model
      phoenixMixer2 = res2.mixer
    })

    loader.load('/models/pegasus1.glb', (gltf) => {
      pegasus = gltf.scene
      
      const pBox = new THREE.Box3().setFromObject(pegasus)
      const pSize = new THREE.Vector3()
      pBox.getSize(pSize)
      const pMaxDim = Math.max(pSize.x, pSize.y, pSize.z, 0.001)
      
      const targetSize = maxDim * 0.02
      const scale = targetSize / pMaxDim
      pegasus.scale.set(scale, scale, scale)

      if (isZoomComplete) {
        pegasus.position.copy(shipCenter).add(new THREE.Vector3(0, -maxDim * 0.05, 0))
      } else {
        pegasus.position.set(shipCenter.x, shipCenter.y - maxDim * 0.1, startZ - maxDim * 0.1)
      }
      
      pegasus.rotation.order = 'YXZ'
      pegasus.rotation.y = Math.PI 

      scene.add(pegasus)

      if (gltf.animations && gltf.animations.length > 0) {
        pegasusMixer = new THREE.AnimationMixer(pegasus)
        pegasusMixer.clipAction(gltf.animations[0]).play()
      }
    })

    // Animate camera zooming in from outside the sphere to inside
    gsap.to(camera.position, {
      duration: 4.5, // 4.5 seconds zoom
      z: endZ,
      ease: 'power2.inOut',
      onUpdate: () => {
        // Keep looking at the center while zooming
        camera.lookAt(shipCenter)
      },
      onComplete: () => {
        isZoomComplete = true
        // Once zooming finishes, initialize OrbitControls to let user look around freely
        controls = new OrbitControls(camera, canvas)
        controls.target.copy(shipCenter)
        controls.enableDamping = true
        controls.dampingFactor = 0.05
        
        // Optional: restrict zoom to stay within the clouds
        controls.maxDistance = maxDim * 0.9
      }
    })
  })

  const clock = new THREE.Clock()

  const tick = () => {
    const delta = clock.getDelta()
    
    if (isZoomComplete) {
      heartTime += delta * 0.8
    }

    // Update animations
    if (phoenixMixer) phoenixMixer.update(delta)
    if (phoenixMixer2) phoenixMixer2.update(delta)
    if (pegasusMixer) pegasusMixer.update(delta)

    const updatePhoenixMovement = (p, timeOffset, isMirror) => {
      if (!p) return

      let targetPos
      let speedMult = 1.0

      if (!isZoomComplete) {
        const xOffset = isMirror ? -maxDim * 0.05 : maxDim * 0.05
        targetPos = new THREE.Vector3(shipCenter.x + xOffset, shipCenter.y + moveSpeedScalar * 0.15, shipCenter.z)
        speedMult = 3.0
      } else {
        const rTime = isMirror ? -heartTime + timeOffset : heartTime + timeOffset
        const startXOffset = isMirror ? -maxDim * 0.05 : maxDim * 0.05
        
        const hX = startXOffset + Math.sin(rTime * 0.4) * maxDim * 0.1
        const hY = moveSpeedScalar * 0.15 + Math.sin(rTime * 0.25) * maxDim * 0.04
        const hZ = Math.sin(rTime * 0.3) * maxDim * 0.08
        
        targetPos = new THREE.Vector3(
          shipCenter.x + hX,
          shipCenter.y + hY, 
          shipCenter.z + hZ  
        )
        speedMult = 1.0
      }
      
      const moveDir = targetPos.clone().sub(p.position)
      const distance = moveDir.length()
      
      if (distance > 0.1) {
        moveDir.normalize()
        
        const moveSpeed = moveSpeedScalar * speedMult * delta
        if (distance < moveSpeed) {
          p.position.copy(targetPos)
        } else {
          p.position.addScaledVector(moveDir, moveSpeed)
        }
        
        const horizontalDir = new THREE.Vector3(moveDir.x, 0, moveDir.z)
        if (horizontalDir.lengthSq() > 0.001) {
          const rotOffset = -Math.PI / 2
          const targetRotation = Math.atan2(horizontalDir.x, horizontalDir.z) + rotOffset
          let diff = targetRotation - p.rotation.y
          diff = Math.atan2(Math.sin(diff), Math.cos(diff))
          p.rotation.y += diff * 4 * delta 
          
          const targetBank = diff * 1.5
          p.rotation.z += (targetBank - p.rotation.z) * 5 * delta
        }

        const targetPitch = -Math.asin(Math.max(-1, Math.min(1, moveDir.y)))
        p.rotation.x += (targetPitch - p.rotation.x) * 4 * delta
      }


    }

    updatePhoenixMovement(phoenix, 0, false)
    updatePhoenixMovement(phoenix2, 0, true)

    if (pegasus) {
      const time = clock.getElapsedTime() * 0.8
      let targetPos
      let speedMult = 1.5

      if (!isZoomComplete) {
        targetPos = new THREE.Vector3(shipCenter.x, shipCenter.y - moveSpeedScalar * 0.15, shipCenter.z)
        speedMult = 3.0
      } else {
        // Fly in a large circle around the ship
        const maxRadius = moveSpeedScalar * 0.4
        const targetX = shipCenter.x + Math.sin(time) * maxRadius
        const targetZ = shipCenter.z + Math.cos(time) * maxRadius
        const targetY = shipCenter.y + Math.sin(time * 2) * moveSpeedScalar * 0.1
        
        targetPos = new THREE.Vector3(targetX, targetY, targetZ)
      }
      
      const moveDir = targetPos.clone().sub(pegasus.position)
      const distance = moveDir.length()
      
      if (distance > 0.1) {
        moveDir.normalize()
        
        const moveSpeed = isZoomComplete ? moveSpeedScalar * 1.5 * delta : moveSpeedScalar * speedMult * delta
        if (distance < moveSpeed) {
          pegasus.position.copy(targetPos)
        } else {
          pegasus.position.addScaledVector(moveDir, moveSpeed)
        }
        
        const horizontalDir = new THREE.Vector3(moveDir.x, 0, moveDir.z)
        if (horizontalDir.lengthSq() > 0.001) {
          const targetRotation = Math.atan2(horizontalDir.x, horizontalDir.z)
          let diff = targetRotation - pegasus.rotation.y
          diff = Math.atan2(Math.sin(diff), Math.cos(diff))
          pegasus.rotation.y += diff * 4 * delta 
          
          const targetBank = diff * 1.5
          pegasus.rotation.z += (targetBank - pegasus.rotation.z) * 5 * delta
        }

        const targetPitch = -Math.asin(Math.max(-1, Math.min(1, moveDir.y)))
        pegasus.rotation.x += (targetPitch - pegasus.rotation.x) * 4 * delta
      }
    }

    if (controls) {
      controls.update()
    }
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
  }
  
  tick()

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  })
}

init()
