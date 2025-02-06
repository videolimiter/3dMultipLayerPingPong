import * as CANNON from "cannon-es"
import { PHYSICS } from "../shared/constants.js"

export class Physics {
  constructor() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, PHYSICS.GRAVITY, 0),
    })

    this.world.broadphase = new CANNON.NaiveBroadphase()
    this.world.solver.iterations = 10

    // Базовые материалы
    this.ballMaterial = new CANNON.Material("ball")
    this.paddleMaterials = {
      left: new CANNON.Material("paddleLeft"),
      right: new CANNON.Material("paddleRight"),
    }
    this.wallMaterials = {
      top: new CANNON.Material("wallTop"),
      bottom: new CANNON.Material("wallBottom"),
    }

    // Создаем контакты для каждого материала
    this.setupContactMaterials()
  }

  setupContactMaterials() {
    // Контакты для ракеток
    Object.entries(this.paddleMaterials).forEach(([side, material]) => {
      const paddleBallContact = new CANNON.ContactMaterial(
        material,
        this.ballMaterial,
        {
          friction: PHYSICS.PADDLE[side.toUpperCase()].FRICTION,
          restitution: PHYSICS.PADDLE[side.toUpperCase()].RESTITUTION,
          contactEquationStiffness: 1e8,
          frictionEquationStiffness: 1e8,
          contactEquationRelaxation: 1,
          frictionEquationRelaxation: 1,
        },
      )
      this.world.addContactMaterial(paddleBallContact)
    })

    // Контакты для стен
    Object.entries(this.wallMaterials).forEach(([side, material]) => {
      const wallBallContact = new CANNON.ContactMaterial(
        material,
        this.ballMaterial,
        {
          friction: PHYSICS.WALL[side.toUpperCase()].FRICTION,
          restitution: PHYSICS.WALL[side.toUpperCase()].RESTITUTION,
          contactEquationStiffness: 1e8,
          frictionEquationStiffness: 1e8,
          contactEquationRelaxation: 1,
          frictionEquationRelaxation: 1,
        },
      )
      this.world.addContactMaterial(wallBallContact)
    })
  }

  update(deltaTime) {
    if (!deltaTime) deltaTime = 1 / 64
    this.world.step(deltaTime)
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

  getPaddleMaterial(side) {
    return this.paddleMaterials[side]
  }

  getWallMaterial(side) {
    return this.wallMaterials[side]
  }
}
