import * as CANNON from "cannon-es"
import { PHYSICS, GAME } from "../shared/constants.js"
import { PaddleState } from "./PaddleState.js"

export class Paddle {
  constructor(physics) {
    this.physics = physics
    this.side = null
    this.body = null
    this.velocity = new CANNON.Vec3()
    this.currentSpeed = 0
    this.maxSpeed = PHYSICS.PADDLE.MAX_SPEED
    this.acceleration = PHYSICS.PADDLE.ACCELERATION
    this.deceleration = PHYSICS.PADDLE.DECELERATION
    this.friction = PHYSICS.PADDLE.FRICTION
    this.restitution = PHYSICS.PADDLE.RESTITUTION
    this.input = { direction: 0 }
    this.createPhysics()
  }

  createPhysics() {
    const shape = new CANNON.Box(
      new CANNON.Vec3(
        PHYSICS.PADDLE.WIDTH / 2,
        PHYSICS.PADDLE.HEIGHT / 2,
        PHYSICS.PADDLE.DEPTH / 2,
      ),
    )

    this.body = new CANNON.Body({
      mass: 0,
      material: this.physics.paddleMaterial,
      type: CANNON.Body.KINEMATIC,
      shape: shape,
    })

    this.body.isPaddle = true
  }

  init(side) {
    this.side = side
    const xPos =
      side === "left" ? -GAME.FIELD.WIDTH / 2 + 2 : GAME.FIELD.WIDTH / 2 - 2
    this.body.position.set(xPos, 0, 0)

    // Применяем настройки в зависимости от стороны
    const paddleConfig = PHYSICS.PADDLE[side.toUpperCase()]
    this.maxSpeed = paddleConfig.MAX_SPEED
    this.acceleration = paddleConfig.ACCELERATION
    this.deceleration = paddleConfig.DECELERATION
    this.friction = paddleConfig.FRICTION
    this.restitution = paddleConfig.RESTITUTION

    this.physics.addBody(this.body)
    this.paddleState = new PaddleState()
    this.body.paddleState = this.paddleState
  }

  setInput(data) {
    console.log("DIRECTION: ", data)
    if (typeof data === "number") {
      this.input.direction = Number(data)
      console.log("DIRECTION: ", data)
    } else {
      console.error("Invalid input data:", data)
      this.input.direction = 0
    }
  }

  update(deltaTime) {
    if (!deltaTime) deltaTime = 1 / 60

    // Обработка ускорения/замедления
    const targetSpeed = this.input.direction !== 0 ? this.maxSpeed : 0
    const acceleration =
      this.input.direction !== 0 ? this.acceleration : this.deceleration

    // Плавное изменение скорости
    if (this.currentSpeed < targetSpeed) {
      this.currentSpeed = Math.min(
        this.currentSpeed + acceleration * deltaTime,
        targetSpeed,
      )
    } else if (this.currentSpeed > targetSpeed) {
      this.currentSpeed = Math.max(
        this.currentSpeed - acceleration * deltaTime,
        targetSpeed,
      )
    }

    if (this.currentSpeed !== 0) {
      const direction =
        this.side === "right" ? -this.input.direction : this.input.direction
      const moveAmount = direction * this.currentSpeed * deltaTime

      if (isNaN(this.body.position.z)) {
        this.body.position.z = 0
      }

      const newPosition = this.body.position.z + moveAmount
      const maxZ = GAME.FIELD.HEIGHT / 2 - PHYSICS.PADDLE.HEIGHT / 2

      this.body.position.z = Math.max(-maxZ, Math.min(maxZ, newPosition))
      this.body.velocity.z = direction * this.currentSpeed
    } else {
      // Обнуляем скорость при остановке
      this.body.velocity.z = 0
    }

    this.body.position.y = 0
    this.body.velocity.y = 0
  }

  getImpactData() {
    return {
      velocity: this.velocity.clone(),
      speed: this.currentSpeed,
      friction: this.friction,
      restitution: this.restitution,
    }
  }

  getState() {
    const state = {
      position: {
        x: this.body.position.x,
        y: this.body.position.y,
        z: this.body.position.z,
      },
      velocity: {
        x: this.body.velocity.x,
        y: this.body.velocity.y,
        z: this.body.velocity.z,
      },
    }

    return state
  }
}
