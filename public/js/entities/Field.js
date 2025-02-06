import * as CANNON from "cannon-es"
import * as THREE from "three"
import { GAME } from "../../../shared/constants.js"
import { Entity } from "./Entity.js"

export class Field extends Entity {
  constructor(scene, physics) {
    super(scene, physics)
    this.walls = []
  }

  async init() {
    this.createField()
    this.createWalls()
  }

  createField() {
    // Создаем поле (визуальное)
    const fieldGeometry = new THREE.PlaneGeometry(
      GAME.FIELD.WIDTH,
      GAME.FIELD.HEIGHT,
    )
    const fieldMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a472a, // Темно-зеленый цвет как в настольном теннисе
      side: THREE.DoubleSide,
    })

    this.mesh = new THREE.Mesh(fieldGeometry, fieldMaterial)
    this.mesh.rotation.x = -Math.PI / 2
    this.mesh.receiveShadow = true
    this.scene.add(this.mesh)

    // Добавляем центральную линию
    const lineGeometry = new THREE.PlaneGeometry(0.1, GAME.FIELD.HEIGHT)
    const lineMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    })
    const centerLine = new THREE.Mesh(lineGeometry, lineMaterial)
    centerLine.rotation.x = -Math.PI / 2
    centerLine.position.y = 0.01 // Чуть выше поля
    this.scene.add(centerLine)
  }

  createWalls() {
    const wallMaterial = new THREE.MeshPhongMaterial({
      color: 0x808080,
      transparent: false,
      opacity: 1,
    })

    // Создаем физические и визуальные стены
    const walls = [
      // Верхняя стена
      {
        pos: [0, 0, -GAME.FIELD.HEIGHT / 2],
        size: [
          GAME.FIELD.WIDTH,
          GAME.FIELD.WALL_HEIGHT,
          GAME.FIELD.WALL_THICKNESS,
        ],
        rot: [0, 0, 0],
      },
      // Нижняя стена
      {
        pos: [0, 0, GAME.FIELD.HEIGHT / 2],
        size: [
          GAME.FIELD.WIDTH,
          GAME.FIELD.WALL_HEIGHT,
          GAME.FIELD.WALL_THICKNESS,
        ],
        rot: [0, 0, 0],
      },
    ]

    walls.forEach((wall) => {
      // Визуальная часть
      const geometry = new THREE.BoxGeometry(...wall.size)
      const mesh = new THREE.Mesh(geometry, wallMaterial)
      mesh.position.set(...wall.pos)
      mesh.rotation.set(...wall.rot)
      mesh.castShadow = true
      mesh.receiveShadow = true
      this.scene.add(mesh)

      // Физическая часть
      const shape = new CANNON.Box(
        new CANNON.Vec3(wall.size[0] / 2, wall.size[1] / 2, wall.size[2] / 2),
      )
      const body = new CANNON.Body({
        mass: 0,
        shape: shape,
        material: this.physics.wallMaterial,
      })
      body.position.set(...wall.pos)
      body.quaternion.setFromEuler(...wall.rot)

      this.physics.addBody(body)
      this.walls.push({ mesh, body })
    })
  }

  // Метод для проверки гола
  checkGoal(ballPosition) {
    const halfWidth = GAME.FIELD.WIDTH / 2
    if (ballPosition.x <= -halfWidth) {
      return "right" // Гол в левые ворота, очко правому игроку
    } else if (ballPosition.x >= halfWidth) {
      return "left" // Гол в правые ворота, очко левому игроку
    }
    return null
  }

  destroy() {
    super.destroy()
    // Удаляем все стены
    this.walls.forEach((wall) => {
      this.scene.remove(wall.mesh)
      wall.mesh.geometry.dispose()
      wall.mesh.material.dispose()
      this.physics.removeBody(wall.body)
    })
    this.walls = []
  }
}
