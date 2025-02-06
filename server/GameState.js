import { GAME, PHYSICS } from "../shared/constants.js"
import { Ball } from "./Ball.js"
import { Physics } from "./Physics.js"
import { Player } from "./Player.js"
import { Wall } from "./Wall.js"

export class GameState {
  constructor() {
    this.physics = new Physics()
    this.players = new Map()
    this.ball = null
    this.topWall = new Wall(this.physics, "top")
    this.bottomWall = new Wall(this.physics, "bottom")
    this.scores = { left: 0, right: 0 }
    this.lastUpdateTime = Date.now()
    this.isGameOver = false
  }

  init() {
    this.ball = new Ball(this.physics)
    this.ball.init()
    this.topWall.init()
    this.bottomWall.init()
  }

  addPlayer(id, side) {
    const player = new Player(this.physics, side)
    player.init()
    this.players.set(id, player)

    return player
  }

  checkGoal() {
    const ballX = this.ball.body.position.x
    const fieldWidth = GAME.FIELD.WIDTH / 2 + PHYSICS.BALL.RADIUS

    if (ballX < -fieldWidth) {
      return "right"
    } else if (ballX > fieldWidth) {
      return "left"
    }
    return null
  }

  handleGoal(side) {
    console.log(`Goal scored by ${side} side!`)
    this.scores[side]++
    this.ball.reset()
  }

  update(deltaTime) {
    // Используем переданный фиксированный deltaTime
    if (!deltaTime) deltaTime = 1 / 64 // Значение по умолчанию

    // Проверяем, что игра не закончена и мяч существует
    if (!this.isGameOver && this.ball) {
      this.physics.update(deltaTime) // Передаем deltaTime в физический движок
      this.ball.update(deltaTime)

      // Проверяем голы
      const goalSide = this.checkGoal()
      if (goalSide) {
        this.handleGoal(goalSide)
      }
    }

    // Обновляем игроков с тем же временным шагом
    for (const [id, player] of this.players) {
      player.update(deltaTime)
    }

    const state = {
      ball: this.ball?.getState(),
      players: Array.from(this.players.entries()).map(([id, player]) => ({
        id,
        ...player.getState(),
      })),
      scores: this.scores,
      isGameOver: this.isGameOver,
      timestamp: Date.now(), // Добавляем временную метку
    }

    return state
  }

  setWallProperties(side, properties) {
    const wall = side === "left" ? this.leftWall : this.rightWall
    if (properties.bounciness !== undefined) {
      wall.setBounciness(properties.bounciness)
    }
    if (properties.friction !== undefined) {
      wall.setFriction(properties.friction)
    }
  }

  removePlayer(id) {
    const player = this.players.get(id)
    if (player) {
      player.destroy()
      this.players.delete(id)
      this.isGameOver = true
      return player.side
    }
    return null
  }

  cleanup() {
    // Очищаем всех игроков
    this.players.forEach((player) => {
      if (player.paddle) {
        this.physics.removeBody(player.paddle.body)
        player.paddle = null
      }
    })
    this.players.clear()

    // Очищаем мяч
    if (this.ball) {
      this.physics.removeBody(this.ball.body)
      this.ball = null
    }

    // Очищаем стены
    if (this.topWall) {
      this.physics.removeBody(this.topWall.body)
      this.topWall = null
    }

    if (this.bottomWall) {
      this.physics.removeBody(this.bottomWall.body)
      this.bottomWall = null
    }

    // Сбрасываем все состояния
    this.scores = { left: 0, right: 0 }
    this.isGameOver = false
    this.lastUpdateTime = Date.now()

    // Пересоздаем физический мир
    this.physics = new Physics()

    // Пересоздаем и инициализируем компоненты
    this.topWall = new Wall(this.physics, "top")
    this.bottomWall = new Wall(this.physics, "bottom")
    this.ball = new Ball(this.physics)

    // Инициализируем компоненты
    this.topWall.init()
    this.bottomWall.init()
    this.ball.init()
  }

  getState() {
    return {
      ball: this.ball?.getState(),
      players: Array.from(this.players.entries()).map(([id, player]) => ({
        id,
        ...player.getState(),
      })),
      scores: this.scores,
      isGameOver: this.isGameOver,
    }
  }
}
