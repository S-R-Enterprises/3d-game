import * as THREE from 'three'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import Experience from '../experience.js'

/**
 * Large 3D ODYSSEY title — replaces the HexianWeb letter mesh ("bottom").
 */
export default class OdysseyTitle {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.debug = this.experience.debug

    // World position of the old HexianWeb "bottom" letters
    this.params = {
      text: 'ODYSSEY',
      size: 1.35,
      depth: 0.35,
      position: { x: -6.5, y: 1.05, z: 1.4 },
      rotationY: 0,
      color: '#c4a574',
      emissive: '#2a1c0e',
    }

    this.group = new THREE.Group()
    this.group.name = 'odysseyTitle'
    this.scene.add(this.group)

    this.createTitle()

    if (this.debug.active) {
      this.debugInit()
    }
  }

  createTitle() {
    const font = this.resources.items.helvetikerBold
    if (!font) {
      console.warn('Odyssey title font not loaded')
      return
    }

    const geometry = new TextGeometry(this.params.text, {
      font,
      size: this.params.size,
      depth: this.params.depth,
      curveSegments: 3,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.04,
      bevelOffset: 0,
      bevelSegments: 2,
    })
    geometry.center()

    const material = new THREE.MeshStandardMaterial({
      color: this.params.color,
      emissive: this.params.emissive,
      emissiveIntensity: 0.2,
      metalness: 0.05,
      roughness: 0.7,
    })

    this.textMesh = new THREE.Mesh(geometry, material)
    this.textMesh.castShadow = true
    this.textMesh.receiveShadow = true
    this.group.add(this.textMesh)

    // Wooden board behind the letters
    const boardGeo = new THREE.BoxGeometry(11.5, 2.4, 0.25)
    const boardMat = new THREE.MeshStandardMaterial({
      color: '#5c3d24',
      roughness: 0.92,
      metalness: 0,
    })
    this.boardMesh = new THREE.Mesh(boardGeo, boardMat)
    this.boardMesh.position.set(0, 0, -0.35)
    this.boardMesh.castShadow = true
    this.boardMesh.receiveShadow = true
    this.group.add(this.boardMesh)

    // Support posts
    const postGeo = new THREE.BoxGeometry(0.35, 2.8, 0.35)
    const postMat = boardMat
    ;[-5.2, 5.2].forEach((x) => {
      const post = new THREE.Mesh(postGeo, postMat)
      post.position.set(x, -0.9, -0.35)
      post.castShadow = true
      this.group.add(post)
    })

    this.applyTransform()
  }

  applyTransform() {
    this.group.position.set(
      this.params.position.x,
      this.params.position.y,
      this.params.position.z,
    )
    this.group.rotation.y = this.params.rotationY
  }

  debugInit() {
    const folder = this.debug.ui.addFolder({
      title: 'Odyssey Title',
      expanded: false,
    })

    ;['x', 'y', 'z'].forEach((axis) => {
      folder.addBinding(this.params.position, axis, {
        label: axis.toUpperCase(),
        min: -40,
        max: 40,
        step: 0.05,
      }).on('change', () => this.applyTransform())
    })

    folder.addBinding(this.params, 'rotationY', {
      label: 'Rotation Y',
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
    }).on('change', () => this.applyTransform())

    folder.addBinding(this.params, 'color', {
      label: 'Color',
      view: 'color',
    }).on('change', () => {
      if (this.textMesh) {
        this.textMesh.material.color.set(this.params.color)
      }
    })
  }
}

// Updated on 2026-08-28
 
