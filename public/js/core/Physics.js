import * as CANNON from "cannon-es"
import { PHYSICS } from "../../../shared/constants.js"

export class Physics {
  constructor() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, PHYSICS.GRAVITY, 0),
    })

    // Оптимизация физики
    this.world.broadphase = new CANNON.NaiveBroadphase()
    this.world.solver.iterations = 10
    this.world.allowSleep = true

    // Создаем материалы
    this.groundMaterial = new CANNON.Material("ground")
    this.ballMaterial = new CANNON.Material("ball")
    this.paddleMaterial = new CANNON.Material("paddle")

    // Настраиваем контакт между мячом и ракеткой
    const paddleBallContact = new CANNON.ContactMaterial(
      this.paddleMaterial,
      this.ballMaterial,
      {
        friction: PHYSICS.PADDLE.FRICTION,
        restitution: PHYSICS.PADDLE.RESTITUTION,
        contactEquationStiffness: 1e8,
        contactEquationRelaxation: 3,
      },
    )

    // Настраиваем контакт между мячом и стенами
    const groundBallContact = new CANNON.ContactMaterial(
      this.groundMaterial,
      this.ballMaterial,
      {
        friction: PHYSICS.BALL.FRICTION,
        restitution: PHYSICS.BALL.RESTITUTION,
        contactEquationStiffness: 1e6,
        contactEquationRelaxation: 3,
      },
    )

    this.world.addContactMaterial(paddleBallContact)
    this.world.addContactMaterial(groundBallContact)
  }

  init() {
    // Дополнительная инициализация, если нужна
  }

  update() {
    this.world.step(PHYSICS.TIME_STEP)
  }

  addBody(body) {
    this.world.addBody(body)
  }

  removeBody(body) {
    this.world.removeBody(body)
  }

  getBallMaterial() {
    return this.ballMaterial
  }

  getGroundMaterial() {
    return this.groundMaterial
  }

  getPaddleMaterial() {
    return this.paddleMaterial
  }
}
