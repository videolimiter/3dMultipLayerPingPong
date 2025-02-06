import * as THREE from "three"

export class SceneLighting {
  constructor(scene) {
    this.scene = scene
  }

  init() {
    this.setupAmbientLight()
    this.setupDirectionalLight()
    this.setupHemisphereLight()
  }

  setupAmbientLight() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    this.scene.add(ambientLight)
  }

  setupDirectionalLight() {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(100, 200, 50)
    directionalLight.castShadow = true

    // Значительно увеличенные настройки теней
    directionalLight.shadow.mapSize.width = 4096
    directionalLight.shadow.mapSize.height = 4096
    directionalLight.shadow.camera.near = 0.1
    directionalLight.shadow.camera.far = 2000
    directionalLight.shadow.camera.left = -5000
    directionalLight.shadow.camera.right = 5000
    directionalLight.shadow.camera.top = 5000
    directionalLight.shadow.camera.bottom = -5000

    // Улучшение качества теней
    directionalLight.shadow.bias = -0.0001
    directionalLight.shadow.normalBias = 0.02
    directionalLight.shadow.radius = 1.5

    this.scene.add(directionalLight)
  }

  setupHemisphereLight() {
    const hemisphereLight = new THREE.HemisphereLight(0x7aa2ff, 0x8a754b, 0.4)
    this.scene.add(hemisphereLight)
  }
}
