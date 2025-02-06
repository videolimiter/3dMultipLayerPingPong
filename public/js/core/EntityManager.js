import { PHYSICS } from "../../../shared/constants.js"
import { Ball } from "../entities/Ball.js"
import { Field } from "../entities/Field.js"
import { Player } from "../entities/Player.js"
export class EntityManager {
  constructor(scene, physics) {
    this.scene = scene
    this.physics = physics
    this.entities = new Map()
    this.localPlayer = null
    this.opponent = null
    this.ball = null
    this.field = null
    this.scoreElements = {
      left: document.getElementById("leftScore"),
      right: document.getElementById("rightScore"),
    }
  }

  async init(isHost) {
    // Создаем только поле, так как оно статично
    this.field = new Field(this.scene, this.physics)
    await this.field.init()

    // Создаем только визуальные представления
    this.ball = new Ball(this.scene)
    await this.ball.init()

    // Создаем локального игрока и оппонента только как визуальные объекты
    const side = isHost ? "left" : "right"
    this.localPlayer = new Player(this.scene, side)
    await this.localPlayer.init()

    const opponentSide = isHost ? "right" : "left"
    this.opponent = new Player(this.scene, opponentSide)
    await this.opponent.init()

    // Устанавливаем начальные позиции за пределами поля
    this.ball.mesh.position.set(0, -100, 0) // Прячем мяч
    this.localPlayer.paddle.mesh.position.set(
      side === "left"
        ? -PHYSICS.PADDLE.INITIAL_POSITIONS.left
        : PHYSICS.PADDLE.INITIAL_POSITIONS.right,
      -100,
      0,
    )
    this.opponent.paddle.mesh.position.set(
      opponentSide === "left"
        ? -PHYSICS.PADDLE.INITIAL_POSITIONS.left
        : PHYSICS.PADDLE.INITIAL_POSITIONS.right,
      -100,
      0,
    )
  }

  updateFromState(state) {
    // Обновляем позиции из состояния сервера
    if (state.ball && this.ball && this.ball.mesh) {
      this.ball.mesh.position.copy(state.ball.position)
    }

    state.players.forEach((playerState) => {
      const player =
        playerState.side === this.localPlayer.side
          ? this.localPlayer
          : this.opponent

      if (player && player.paddle && player.paddle.mesh && playerState.paddle) {
        player.paddle.mesh.position.copy(playerState.paddle.position)
      }
    })

    if (state.scores) {
      this.updateScoreDisplay(state.scores)
    }
  }

  updateScoreDisplay(scores) {
    if (this.scoreElements.left) {
      this.scoreElements.left.textContent = scores.left
    }
    if (this.scoreElements.right) {
      this.scoreElements.right.textContent = scores.right
    }
  }

  destroy() {
    if (this.field) {
      this.field.destroy()
    }
    if (this.ball) {
      this.ball.destroy()
    }
    if (this.localPlayer) {
      this.localPlayer.destroy()
    }
    if (this.opponent) {
      this.opponent.destroy()
    }
  }

  update() {
    // Обновляем только визуальные компоненты
    if (this.field) {
      this.field.update()
    }

    if (this.ball && this.ball.mesh) {
      const currentPosition = this.ball.mesh.position
      // Плавное обновление позиции мяча
      this.ball.mesh.position.lerp(currentPosition, 0.1)
    }

    if (this.localPlayer && this.localPlayer.paddle) {
      this.localPlayer.paddle.update()
    }

    if (this.opponent && this.opponent.paddle) {
      this.opponent.paddle.update()
    }
  }
}
