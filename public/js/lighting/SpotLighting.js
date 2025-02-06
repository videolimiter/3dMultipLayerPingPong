import * as THREE from "three"

export class SpotLighting {
  constructor(scene) {
    this.scene = scene
    this.spotLight = null
  }

  init() {
    // Создаем SpotLight
    this.spotLight = new THREE.SpotLight(0xffffff, 1)
    this.spotLight.position.set(0, 100, 0)
    this.spotLight.angle = Math.PI / 15 // 60 градусов
    this.spotLight.penumbra = 0.2
    this.spotLight.decay = 1
    this.spotLight.distance = 2000

    // Настройка теней
    this.spotLight.castShadow = true
    this.spotLight.shadow.mapSize.width = 4096
    this.spotLight.shadow.mapSize.height = 4096
    this.spotLight.shadow.camera.near = 0.1
    this.spotLight.shadow.camera.far = 2000
    this.spotLight.shadow.bias = -0.0001
    this.spotLight.shadow.normalBias = 0.02
    this.spotLight.shadow.radius = 1.5

    this.scene.add(this.spotLight)

    // Добавляем вспомогательное освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
    this.scene.add(ambientLight)
  }

  // Метод для обновления позиции света относительно шарика
  updatePosition(ballPosition) {
    if (this.spotLight) {
      // Располагаем свет над шариком
      this.spotLight.position.set(
        ballPosition.x,
        100, // Высота света
        ballPosition.z,
      )

      // Направляем свет на шарик
      this.spotLight.target.position.set(ballPosition.x, 0, ballPosition.z)

      // Важно! Обновляем позицию target
      this.spotLight.target.updateMatrixWorld()
    }
  }
}
