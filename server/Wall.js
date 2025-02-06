import * as CANNON from "cannon-es"
import { PHYSICS, GAME } from "../shared/constants.js"

export class Wall {
  constructor(physics, side) {
    this.physics = physics
    this.side = side // "top" или "bottom"
    this.body = null
    this.wallState = {
      restitution: PHYSICS.WALL[side.toUpperCase()].RESTITUTION,
      friction: PHYSICS.WALL[side.toUpperCase()].FRICTION,
      bounceModifier: PHYSICS.WALL[side.toUpperCase()].BOUNCE_MODIFIER,
    }
    this.createPhysics()
  }

  createPhysics() {
    // Размеры стенки: ширина поля x высота стенки x толщина стенки
    const shape = new CANNON.Box(
      new CANNON.Vec3(
        GAME.FIELD.WIDTH / 2,
        GAME.FIELD.WALL_HEIGHT / 2,
        GAME.FIELD.WALL_THICKNESS / 2,
      ),
    )

    this.body = new CANNON.Body({
      mass: 0,
      material: this.physics.getWallMaterial(this.side),
      type: CANNON.Body.STATIC,
      shape: shape,
    })

    this.body.isWall = true
    this.body.wallSide = this.side
    this.body.wallState = this.wallState
  }

  init() {
    const zPos =
      this.side === "top" ? -GAME.FIELD.HEIGHT / 2 : GAME.FIELD.HEIGHT / 2

    // x: 0 (центр), y: высота стенки/2, z: позиция верх/низ
    this.body.position.set(0, GAME.FIELD.WALL_HEIGHT / 2, zPos)
    this.physics.addBody(this.body)
  }

  updateProperties(properties) {
    if (properties.restitution !== undefined) {
      this.wallState.restitution = properties.restitution
      const contact = this.physics.world.getContactMaterial(
        this.physics.getWallMaterial(this.side),
        this.physics.ballMaterial,
      )
      if (contact) {
        contact.restitution = properties.restitution
      }
    }
    if (properties.friction !== undefined) {
      this.wallState.friction = properties.friction
      const contact = this.physics.world.getContactMaterial(
        this.physics.getWallMaterial(this.side),
        this.physics.ballMaterial,
      )
      if (contact) {
        contact.friction = properties.friction
      }
    }
    if (properties.bounceModifier !== undefined) {
      this.wallState.bounceModifier = properties.bounceModifier
    }
  }
}
