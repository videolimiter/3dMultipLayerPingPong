import * as THREE from "three"
import * as CANNON from "cannon-es"
import { BallMaterial } from "../materials/BallMaterial.js"

export class OtherPlayers {
  constructor(scene, physics) {
    this.scene = scene
    this.physics = physics
    this.players = new Map()
  }

  addPlayer(id, position, quaternion) {
    const geometry = new THREE.SphereGeometry(0.5, 32, 32)
    const material = BallMaterial.create()
    const mesh = new THREE.Mesh(geometry, material)

    mesh.position.copy(position)
    mesh.quaternion.copy(quaternion)
    mesh.castShadow = true
    mesh.receiveShadow = true

    const shape = new CANNON.Sphere(0.5)
    const body = new CANNON.Body({
      mass: 1,
      shape: shape,
      material: this.physics.getBallMaterial(),
      linearDamping: 0.3,
      angularDamping: 0.3,
      fixedRotation: false,
    })

    body.position.copy(position)
    body.quaternion.copy(quaternion)

    this.players.set(id, { mesh, body })
    this.scene.add(mesh)
    this.physics.addBody(body)
  }

  updatePlayer(id, position, quaternion) {
    const player = this.players.get(id)
    if (player) {
      player.body.position.copy(position)
      player.body.quaternion.copy(quaternion)
      player.mesh.position.copy(position)
      player.mesh.quaternion.copy(quaternion)
    }
  }

  removePlayer(id) {
    const player = this.players.get(id)
    if (player) {
      // Удаляем меш из сцены
      if (player.mesh) {
        this.scene.remove(player.mesh)
        player.mesh.geometry.dispose()
        player.mesh.material.dispose()
      }
      d
      // Удаляем физическое тело
      if (player.body) {
        this.physics.world.removeBody(player.body)
      }

      this.players.delete(id)
      console.log(`Player ${id} fully removed with cleanup`)
    }
  }

  // Метод для полной очистки всех игроков
  removeAllPlayers() {
    this.players.forEach((player, id) => {
      this.removePlayer(id)
    })
    this.players.clear()
    console.log("All players removed")
  }

  update() {
    this.players.forEach((player) => {
      player.mesh.position.copy(player.body.position)
      player.mesh.quaternion.copy(player.body.quaternion)
    })
  }
}
