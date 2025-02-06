import { Paddle } from "./Paddle.js"
import { PaddleState } from "./PaddleState.js"

export class Player {
  constructor(physics, side) {
    this.physics = physics
    this.side = side
    this.paddle = new Paddle(physics)
    this.score = 0

    // Создаем уникальные состояния для каждой ракетки
    if (side === "left") {
      this.paddle.paddleState = new PaddleState({
        power: 1.0,
        speedMultiplier: 1.0,
        bounceAngleMultiplier: 1.0,
      })
    } else {
      this.paddle.paddleState = new PaddleState({
        power: 1.0,
        speedMultiplier: 1.0,
        bounceAngleMultiplier: 1.0,
      })
    }
  }

  init() {
    this.paddle.init(this.side)
  }

  setInput(data) {
    this.paddle.setInput(data)
  }

  update(deltaTime) {
    this.paddle.update(deltaTime)
  }

  getPosition() {
    return this.paddle.body.position
  }

  getVelocity() {
    return this.paddle.body.velocity
  }

  incrementScore() {
    this.score++
    return this.score
  }

  getState() {
    const state = {
      side: this.side,
      score: this.score,
      paddle: this.paddle.getState(),
    }

    return state
  }

  destroy() {
    if (this.paddle) {
      this.physics.removeBody(this.paddle.body)
      this.paddle = null
    }
  }
}
