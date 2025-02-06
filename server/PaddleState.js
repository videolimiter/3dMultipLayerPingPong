import { PHYSICS } from "../shared/constants.js"

export class PaddleState {
  constructor(config = {}) {
    // Базовые значения
    this.power = config.power || 1.0
    this.speedMultiplier = config.speedMultiplier || 1.0
    this.bounceAngleMultiplier = config.bounceAngleMultiplier || 1.0
    this.restitution = config.restitution || PHYSICS.PADDLE.RESTITUTION
    this.friction = config.friction || PHYSICS.PADDLE.FRICTION
  }

  // Модификаторы
  setPower(value) {
    this.power = Math.max(0.5, Math.min(2.0, value))
  }

  setSpeedMultiplier(value) {
    this.speedMultiplier = Math.max(0.5, Math.min(2.0, value))
  }

  setBounceAngleMultiplier(value) {
    this.bounceAngleMultiplier = Math.max(0.5, Math.min(1.5, value))
  }

  getState() {
    return {
      power: this.power,
      speedMultiplier: this.speedMultiplier,
      bounceAngleMultiplier: this.bounceAngleMultiplier,
      restitution: this.restitution,
      friction: this.friction,
    }
  }
}
