import * as THREE from "three"

export class BallMaterial {
  static async create() {
    // Загружаем текстуру
    const textureLoader = new THREE.TextureLoader()
    const texture = await new Promise((resolve) => {
      textureLoader.load(
        // Используем текстуру баскетбольного мяча для наглядности вращения
        "https://thumbs.dreamstime.com/b/пре-став-енное-реа-истическое-и-юстрации-баскетбо-а-пре-посы-ки-d-42601103.jpg",
        (texture) => {
          texture.wrapS = THREE.RepeatWrapping
          texture.wrapT = THREE.RepeatWrapping
          resolve(texture)
        },
      )
    })

    // Создаем материал с текстурой
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.7,
      metalness: 0.1,
    })

    return material
  }

  static createRandom() {
    // Этот метод оставляем для других игроков
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(Math.random(), Math.random(), Math.random()),
      roughness: 0.7,
      metalness: 0.1,
    })
  }
}
