import * as THREE from "three"

export class GroundMaterial {
  static async create() {
    const textureLoader = new THREE.TextureLoader()

    try {
      // Используем другие текстуры, которые точно доступны
      const [diffuseMap, normalMap, roughnessMap] = await Promise.all([
        this.loadTexture(
          textureLoader,
          "https://parketsolo.ru/wa-data/public/shop/products/65/48/4865/images/9647/9647.970.jpg",
        ),
        this.loadTexture(
          textureLoader,
          "https://parketsolo.ru/wa-data/public/shop/products/65/48/4865/images/9647/9647.970.jpg",
        ),
        this.loadTexture(
          textureLoader,
          "https://parketsolo.ru/wa-data/public/shop/products/65/48/4865/images/9647/9647.970.jpg",
        ),
      ])

      // Настраиваем повторение текстур
      const textures = [diffuseMap, normalMap, roughnessMap]
      textures.forEach((texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(20, 20)
      })

      // Создаем материал
      const material = new THREE.MeshStandardMaterial({
        map: diffuseMap,
        normalMap: normalMap,
        roughnessMap: roughnessMap,
        normalScale: new THREE.Vector2(1, 1),
        roughness: 0.8,
        metalness: 0.2,
      })

      return material
    } catch (error) {
      console.warn("Failed to load textures, using fallback material")
      // Возвращаем простой материал если текстуры не загрузились
      return new THREE.MeshStandardMaterial({
        color: 0x808080,
        roughness: 0.8,
        metalness: 0.2,
      })
    }
  }

  static loadTexture(loader, url) {
    return new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject)
    })
  }
}
