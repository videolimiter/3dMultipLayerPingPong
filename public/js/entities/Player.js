import { Paddle } from "./Paddle.js"
import { PHYSICS } from "../../../shared/constants.js"

export class Player {
  constructor(scene, side) {
    this.scene = scene
    this.side = side
    this.score = 0
    this.paddle = null
  }

  async init() {
    this.paddle = new Paddle(this.scene)
    await this.paddle.init()

    // Начальная позиция будет установлена через updateFromState
    this.paddle.mesh.position.set(
      this.side === "left"
        ? -PHYSICS.PADDLE.INITIAL_POSITIONS.left
        : PHYSICS.PADDLE.INITIAL_POSITIONS.right,
      -100, // Прячем ракетку до получения состояния от сервера
      0,
    )
  }

  updateFromState(state) {
    if (this.paddle && this.paddle.mesh && state.paddle) {
      this.paddle.mesh.position.copy(state.paddle.position)
    }
    if (state.score !== undefined) {
      this.score = state.score
    }
  }

  destroy() {
    if (this.paddle) {
      this.paddle.destroy()
      this.paddle = null
    }
  }

  update(deltaTime) {
    if (this.paddle && this.paddle.mesh) {
      // Используем более плавную интерполяцию
      const interpolationFactor = 0.3
      this.paddle.mesh.position.lerp(
        this.targetPosition || this.paddle.mesh.position,
        interpolationFactor,
      )
    }
  }
}
