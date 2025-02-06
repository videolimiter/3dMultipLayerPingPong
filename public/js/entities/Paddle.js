import * as THREE from "three"
import { PHYSICS } from "../../../shared/constants.js"

export class Paddle {
  constructor(scene) {
    this.scene = scene
    this.mesh = null
  }

  async init() {
    this.createMesh()
    this.scene.add(this.mesh)
  }

  createMesh() {
    const geometry = new THREE.BoxGeometry(
      PHYSICS.PADDLE.WIDTH,
      PHYSICS.PADDLE.HEIGHT,
      PHYSICS.PADDLE.DEPTH,
    )

    const material = new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      shininess: 30,
    })

    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
  }

  updateFromState(state) {
    if (this.mesh && state.position) {
      this.mesh.position.copy(state.position)
    }
  }

  update() {
    if (this.mesh) {
      const currentPosition = this.mesh.position.clone()
      this.mesh.position.lerp(currentPosition, 0.1)
    }
  }

  destroy() {
    if (this.mesh) {
      this.scene.remove(this.mesh)
      this.mesh.geometry.dispose()
      this.mesh.material.dispose()
      this.mesh = null
    }
  }
}
