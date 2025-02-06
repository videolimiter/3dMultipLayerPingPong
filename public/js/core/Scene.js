import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { GAME } from "../../../shared/constants.js"

export class Scene {
  constructor() {
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    )
    this.renderer = null
    this.controls = null
    this.lights = []
  }

  async init(side = "left") {
    this.setupRenderer()
    this.setupCamera(side)
    this.setupLights()
    this.setupControls()
    this.handleResize()

    // Добавляем туман для атмосферы
    this.scene.fog = new THREE.Fog(0x000000, 20, 150)

    // Устанавливаем цвет фона
    this.scene.background = new THREE.Color(0x000000)

    // Важно: добавляем начальный рендер сцены
    this.render()
  }

  setupRenderer() {
    // Проверяем существующий canvas
    const existingCanvas = document.getElementById("game-canvas")

    this.renderer = new THREE.WebGLRenderer({
      canvas: existingCanvas,
      antialias: true,
    })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

    // Добавляем canvas только если его еще нет
    if (!existingCanvas) {
      document
        .getElementById("game-container")
        .appendChild(this.renderer.domElement)
    }
  }

  setupCamera(side) {
    const cameraConfig = GAME.CAMERA[side]
    this.camera.position.set(
      cameraConfig.POSITION.x,
      cameraConfig.POSITION.y,
      cameraConfig.POSITION.z,
    )
    this.camera.lookAt(cameraConfig.LOOK_AT)
    this.camera.up.copy(cameraConfig.UP)
  }

  setupLights() {
    // Основной свет
    const mainLight = new THREE.DirectionalLight(0xffffff, 10)
    mainLight.position.set(0, 100, 10)
    mainLight.castShadow = true
    mainLight.shadow.mapSize.width = 2048
    mainLight.shadow.mapSize.height = 2048
    this.scene.add(mainLight)
    this.lights.push(mainLight)

    // Настройка теней для основного света
    mainLight.shadow.camera.left = -GAME.FIELD.WIDTH
    mainLight.shadow.camera.right = GAME.FIELD.WIDTH
    mainLight.shadow.camera.top = GAME.FIELD.HEIGHT
    mainLight.shadow.camera.bottom = -GAME.FIELD.HEIGHT
    mainLight.shadow.camera.near = 1
    mainLight.shadow.camera.far = 5000

    // Ambient light для общего освещения
    const ambientLight = new THREE.AmbientLight(0xffffff, 1)
    this.scene.add(ambientLight)
    this.lights.push(ambientLight)

    // Дополнительные точечные источники света
    const pointLight1 = new THREE.PointLight(0x4477ff, 0.5)
    pointLight1.position.set(-10, 80, 0)
    this.scene.add(pointLight1)
    this.lights.push(pointLight1)

    const pointLight2 = new THREE.PointLight(0xff4477, 0.5)
    pointLight2.position.set(10, 80, 0)
    this.scene.add(pointLight2)
    this.lights.push(pointLight2)
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.maxPolarAngle = Math.PI / 2 - 0.1
    this.controls.minDistance = 15
    this.controls.maxDistance = 400
  }

  handleResize() {
    window.addEventListener("resize", () => {
      const width = window.innerWidth
      const height = window.innerHeight
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(width, height)
    })
  }

  add(object) {
    this.scene.add(object)
  }

  remove(object) {
    this.scene.remove(object)
  }

  render() {
    if (!this.renderer) {
      console.error("Renderer is not initialized")
      return
    }

    if (this.controls) {
      this.controls.update()
    }
    this.renderer.render(this.scene, this.camera)
  }

  destroy() {
    // Очищаем ресурсы
    this.lights.forEach((light) => {
      this.scene.remove(light)
    })
    this.lights = []

    this.renderer.dispose()

    if (this.controls) {
      this.controls.dispose()
    }

    // Удаляем canvas
    if (this.renderer.domElement) {
      this.renderer.domElement.remove()
    }
  }
}
