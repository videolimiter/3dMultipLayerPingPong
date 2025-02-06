import * as THREE from "three"
import { Entity } from "./Entity.js"
import { PHYSICS } from "../../../shared/constants.js"

export class Ball extends Entity {
  constructor(scene) {
    super(scene)
    this.mesh = null
  }

  async init() {
    this.createMesh()
    this.scene.add(this.mesh)
  }

  createMesh() {
    const geometry = new THREE.SphereGeometry(
      PHYSICS.BALL.RADIUS,
      PHYSICS.BALL.SEGMENTS,
      PHYSICS.BALL.SEGMENTS,
    )
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      shininess: 60,
    })

    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.castShadow = true
  }

  updateFromState(state) {
    if (this.mesh && state.position) {
      this.mesh.position.copy(state.position)
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
