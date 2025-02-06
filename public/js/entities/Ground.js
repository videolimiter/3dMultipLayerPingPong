import * as THREE from "three"
import * as CANNON from "cannon-es"
import { GroundMaterial } from "../materials/GroundMaterial.js"

export class Ground {
  constructor(scene, physics) {
    this.scene = scene
    this.physics = physics
    this.mesh = null
    this.body = null
  }

  async init() {
    await this.createMesh()
    this.createPhysics()
    this.scene.add(this.mesh)
    this.physics.addBody(this.body)
  }

  async createMesh() {
    const radius = 5
    const length = 100
    const geometry = new THREE.CylinderGeometry(
      radius,
      radius,
      length,
      32,
      1,
      true,
    )

    geometry.scale(1, -1, 1)
    geometry.computeVertexNormals()

    const material = await GroundMaterial.create()
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.rotation.z = -Math.PI / 2
    this.mesh.position.y = -2
    this.mesh.position.z = 0
    this.mesh.receiveShadow = true
  }

  createPhysics() {
    // Создаем составное тело для желоба
    this.body = new CANNON.Body({
      mass: 0,
      material: this.physics.getGroundMaterial(),
    })

    // Основание желоба (полуцилиндр)
    const radius = 5
    const length = 100
    const segments = 32

    // Создаем точки для формы желоба
    for (let i = 0; i < segments / 2; i++) {
      const angle = (i / (segments - 1)) * Math.PI
      const x = radius * Math.cos(angle)
      const y = radius * Math.sin(angle)

      // Создаем плоскость для каждого сегмента
      const normal = new CANNON.Vec3(Math.cos(angle), Math.sin(angle), 0)
      const planeShape = new CANNON.Plane()
      const planeBody = new CANNON.Body({
        mass: 0,
        shape: planeShape,
        material: this.physics.getGroundMaterial(),
      })

      // Позиционируем и поворачиваем плоскость
      planeBody.position.set(x, y - 2, 0)
      planeBody.quaternion.setFromVectors(new CANNON.Vec3(0, 1, 0), normal)

      this.body.addShape(
        planeShape,
        new CANNON.Vec3(x, y - 2, 0),
        planeBody.quaternion,
      )
    }

    // Добавляем боковые стенки
    const wallShape = new CANNON.Box(new CANNON.Vec3(0.5, radius, length / 2))
    this.body.addShape(wallShape, new CANNON.Vec3(-radius, -2, 0))
    this.body.addShape(wallShape, new CANNON.Vec3(radius, -2, 0))
  }

  update() {
    // Для статичного объекта обновление не требуется
  }
}
