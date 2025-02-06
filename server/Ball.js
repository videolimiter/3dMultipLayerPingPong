import * as CANNON from "cannon-es"
import { PHYSICS } from "../shared/constants.js"
import { PaddleState } from "./PaddleState.js"

export class Ball {
  constructor(physics) {
    this.physics = physics
    this.lastHitBy = null
    this.createPhysics()
  }

  createPhysics() {
    const shape = new CANNON.Sphere(PHYSICS.BALL.RADIUS)
    this.body = new CANNON.Body({
      mass: PHYSICS.BALL.MASS,
      shape: shape,
      material: this.physics.ballMaterial,
      linearDamping: PHYSICS.BALL.LINEAR_DAMPING,
      angularDamping: PHYSICS.BALL.ANGULAR_DAMPING,
      contactEquationStiffness: PHYSICS.BALL.CONTACT_EQUATION_STIFFNESS,
      frictionEquationStiffness: 1e8,
      frictionEquationRelaxation: 1,
      fixedRotation: true,
    })
  }

  init() {
    this.physics.addBody(this.body)
    this.reset()
    this.setupCollisionHandler()
  }

  reset() {
    // Останавливаем мяч
    this.body.velocity.setZero()

    // Возвращаем в центр
    this.body.position.set(0, 0, 0)

    // Даем начальную скорость в случайном направлении
    setTimeout(() => {
      const randomAngle = ((Math.random() - 0.5) * Math.PI) / 4
      const speed = PHYSICS.BALL.INITIAL_SPEED
      this.body.velocity.set(
        Math.cos(randomAngle) * speed * (Math.random() < 0.5 ? 1 : -1),
        0,
        Math.sin(randomAngle) * speed,
      )
    }, 1000) // Задержка 1 секунда перед новым раундом
  }

  setupCollisionHandler() {
    if (!this.body) return

    this.body.addEventListener("collide", (event) => {
      const contactBody =
        event.contact.bi === this.body ? event.contact.bj : event.contact.bi

      if (contactBody.isPaddle) {
        this.handlePaddleCollision(contactBody)
      } else if (contactBody.isWall) {
        this.handleWallCollision(contactBody)
      }
    })
  }

  handlePaddleCollision(paddleBody) {
    const ballVelocity = this.body.velocity.clone()
    const speed = ballVelocity.length()

    const paddlePosition = paddleBody.position
    const ballPosition = this.body.position
    const relativePosition = ballPosition.vsub(paddlePosition)

    // Простой зеркальный отскок
    const normalizedY = relativePosition.z / (PHYSICS.PADDLE.HEIGHT / 2)
    const bounceAngle = normalizedY * PHYSICS.BALL.MAX_BOUNCE_ANGLE

    const direction = ballPosition.x < paddlePosition.x ? 1 : -1

    const newVelocity = new CANNON.Vec3()
    newVelocity.x = Math.cos(bounceAngle) * speed * direction
    newVelocity.y = 0
    newVelocity.z = Math.sin(bounceAngle) * speed

    this.body.velocity.copy(newVelocity)
  }

  handleWallCollision(wallBody) {
    const ballVelocity = this.body.velocity.clone()
    const speed = ballVelocity.length()

    // Определяем, с какой стеной столкнулись
    const wallSide = wallBody.wallSide // "top" или "bottom"

    // Инвертируем Z компонент для отражения
    ballVelocity.z *= -1

    // Нормализуем и восстанавливаем скорость
    // ballVelocity.normalize()
    ballVelocity.scale(speed)

    this.body.velocity.copy(ballVelocity)
  }

  getState() {
    return {
      position: this.body.position,
      velocity: this.body.velocity,
      speed: this.body.velocity.length(),
    }
  }

  update() {
    this.body.position.y = 0
    this.body.velocity.y = 0
  }
}
