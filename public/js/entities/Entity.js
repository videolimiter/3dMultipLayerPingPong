export class Entity {
  constructor(scene, physics) {
    this.scene = scene
    this.physics = physics
    this.mesh = null
    this.body = null
  }

  init() {
    throw new Error("Method init() must be implemented")
  }

  update() {
    if (this.mesh && this.body) {
      this.mesh.position.copy(this.body.position)
      this.mesh.quaternion.copy(this.body.quaternion)
    }
  }

  destroy() {
    if (this.mesh) {
      this.scene.remove(this.mesh)
      this.mesh.geometry.dispose()
      this.mesh.material.dispose()
    }
    if (this.body) {
      this.physics.removeBody(this.body)
    }
  }
}
