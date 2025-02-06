import * as THREE from "three"

export class ParticleSystem {
  constructor(scene, color, size) {
    this.scene = scene
    this.particles = null
    this.color = color
    this.size = size
  }

  init() {
    this.createParticleSystem()
  }

  createParticleSystem() {
    // Создание системы частиц
  }

  emit(position, count, spread, speed) {
    // Эмиссия частиц
  }

  update(delta) {
    // Обновление частиц
  }
}
