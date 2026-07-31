import * as THREE from 'three' // 引入 THREE 用于 Vector3
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import Experience from '../experience.js'
import Area from './area.js'
import Effects from './effect.js'
import Environment from './environment.js'
import EventPointManager from './eventPointManager.js' // 引入事件点管理器类
import Hero from './hero.js'
import IntroDialog from './introDialog.js'
import Lava from './lava.js'
import Ocean from './ocean.js'
import PortalEffect from './portal-effect.js'
import Spartans from './spartans.js'

export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.sizes = this.experience.sizes
    this.camera = this.experience.camera

    // 初始化对话框管理器
    this.introDialog = new IntroDialog()

    // 开始轮询显示介绍内容
    this.startIntroContentLoop()

    // 初始化 CSS2D 渲染器
    this.initCSS2DRenderer()

    this.eventPointManager = new EventPointManager() // 实例化事件点管理器
    // Environment
    this.resources.on('ready', () => {
      // Setup
      this.environment = new Environment()
      this.hero = new Hero()
      this.area = new Area()
      // 初始化岩浆效果
      this.lava = new Lava()
      // 初始化海洋
      this.ocean = new Ocean()
      // 初始化传送门效果
      this.portalEffect = new PortalEffect()
      // 初始化斯巴达人
      this.spartans = new Spartans()

      // 英雄和其他资源准备好后，设置事件点
      this.setupEventPoints()
    })

    this.effects = new Effects()
  }

  /**
   * 开始轮询显示介绍内容
   */
  startIntroContentLoop() {
    // 显示第一条内容
    this.introDialog.startIntroContentLoop()
  }

  /**
   * 初始化 CSS2D 渲染器
   */
  initCSS2DRenderer() {
    this.css2dRenderer = new CSS2DRenderer()
    this.css2dRenderer.setSize(this.sizes.width, this.sizes.height)
    this.css2dRenderer.domElement.style.position = 'absolute'
    this.css2dRenderer.domElement.style.top = '0'
    this.css2dRenderer.domElement.style.pointerEvents = 'none'
    document.body.appendChild(this.css2dRenderer.domElement)
  }

  /**
   * 设置场景中的所有事件触发点
   */
  setupEventPoints() {
    // Camp / rest area
    this.eventPointManager.createEventPoint(
      'bed_area',
      new THREE.Vector3(-15.91, -0.21, -10.34),
      3,
      () => {
        this.introDialog.showAreaContent('bed_area')
      },
      'Press F — the weary camp',
    )

    // Wine / feast area
    this.eventPointManager.createEventPoint(
      'beer_area',
      new THREE.Vector3(-22.98, -0.21, -5.02),
      2,
      () => {
        this.introDialog.showAreaContent('beer_area')
      },
      'Press F — amphorae of wine',
    )

    // Craft / raft area
    this.eventPointManager.createEventPoint(
      'workbench_area',
      new THREE.Vector3(-18.57, -0.21, -13.22),
      2,
      () => {
        this.introDialog.showAreaContent('workbench_area')
      },
      'Press F — tools of cunning',
    )

    // Weapons / bow area
    this.eventPointManager.createEventPoint(
      'weapon_area',
      new THREE.Vector3(-12.68, -0.18, -7.16),
      2,
      () => {
        this.introDialog.showAreaContent('weapon_area')
      },
      'Press F — the great bow',
    )

    // Dining / feast area
    this.eventPointManager.createEventPoint(
      'dining_area',
      new THREE.Vector3(-10.71, 1.5, -12),
      2.5,
      () => {
        this.introDialog.showAreaContent('dining_area')
      },
      'Press F — a traveler\'s feast',
    )

    // Kitchen / Circe's hearth
    this.eventPointManager.createEventPoint(
      'kitchen_area',
      new THREE.Vector3(-22.69, 0.71, -1.39),
      2,
      () => {
        this.introDialog.showAreaContent('kitchen_area')
      },
      'Press F — Circe\'s hearth',
    )

    // Well / island water
    this.eventPointManager.createEventPoint(
      'well_area',
      new THREE.Vector3(-5.71, 0.76, -10.10),
      3,
      () => {
        this.introDialog.showAreaContent('well_area')
      },
      'Press F — the island well',
    )

    // Ship Portal
    if (this.portalEffect && this.portalEffect.portalMesh) {
      this.portalEffect.portalMesh.updateWorldMatrix(true, false)
      const pos = new THREE.Vector3()
      this.portalEffect.portalMesh.getWorldPosition(pos)
      this.eventPointManager.createEventPoint(
        'portal_area',
        pos,
        8,
        () => {
          // Create fade-out transition element
          const transitionDiv = document.createElement('div')
          transitionDiv.style.position = 'fixed'
          transitionDiv.style.top = '0'
          transitionDiv.style.left = '0'
          transitionDiv.style.width = '100vw'
          transitionDiv.style.height = '100vh'
          transitionDiv.style.backgroundColor = 'black'
          transitionDiv.style.opacity = '0'
          transitionDiv.style.zIndex = '99999'
          transitionDiv.style.transition = 'opacity 1.5s ease'
          transitionDiv.style.pointerEvents = 'none'
          document.body.appendChild(transitionDiv)
          
          // Trigger reflow to ensure transition works
          transitionDiv.offsetHeight
          
          // Start fade
          transitionDiv.style.opacity = '1'
          
          // Redirect after transition finishes
          setTimeout(() => {
            window.location.href = '/ship.html'
          }, 1500)
        },
        'Press F — to enter another dimension in the Odyssey story',
      )
    }
  }

  update() {
    // Update hero if it exists
    if (this.hero) {
      this.hero.update()
    }
    // 更新岩浆效果
    if (this.lava) {
      this.lava.update()
    }
    if (this.environment) {
      this.environment.update()
    }
    // 更新海洋
    if (this.ocean) {
      this.ocean.update()
    }
    // 更新传送门效果
    if (this.portalEffect) {
      this.portalEffect.update()
    }
    if (this.spartans) {
      this.spartans.update()
    }
    this.effects.update()

    // 更新事件点管理器 (检查是否有事件触发)
    if (this.eventPointManager) {
      this.eventPointManager.update()
    }
    if (this.area) {
      this.area.update()
    }

    // 更新 CSS2D 渲染
    if (this.css2dRenderer && this.camera?.instance) {
      this.css2dRenderer.render(this.scene, this.camera.instance)
    }
  }

  resize() {
    this.effects.resize()
    // 更新岩浆效果尺寸
    if (this.lava) {
      this.lava.resize()
    }

    // 更新 CSS2D 渲染器尺寸
    if (this.css2dRenderer) {
      this.css2dRenderer.setSize(this.sizes.width, this.sizes.height)
    }
  }
}
