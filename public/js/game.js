import { Scene } from "./core/Scene.js"
import { InputManager } from "./core/InputManager.js"
import { NetworkManager } from "./network/NetworkManager.js"
import { EntityManager } from "./core/EntityManager.js"
import { Physics } from "./core/Physics.js"
import { SpeedDisplay } from "./ui/SpeedDisplay.js"

export class Game {
  constructor() {
    window.game = this
    console.log("Game: Constructor called")
    this.network = new NetworkManager()
    this.scene = null
    this.physics = null
    this.entities = null
    this.input = null
    this.isRunning = false
    this.animationFrameId = null
    this.speedDisplay = new SpeedDisplay()
    this.lastTime = performance.now()
  }

  async init() {
    console.log("Game: Starting initialization")
    try {
      // Подключаемся к серверу и показываем лобби
      await this.network.connect()
      console.log("Game: Network connected")

      // Инициализируем лобби
      this.setupLobby()

      // Инициализируем остальные компоненты
      this.scene = new Scene()
      this.physics = new Physics()
      this.entities = new EntityManager(this.scene, this.physics)

      // Настраиваем обработчики сетевых событий
      this.setupNetworkHandlers()
    } catch (error) {
      console.error("Game: Initialization error:", error)
      throw error
    }
  }

  setupNetworkHandlers() {
    this.network.on("gameStart", async () => {
      try {
        console.log("Game starting...")
        const side = this.network.isHost ? "left" : "right"

        // Инициализируем сцену и физику
        if (!this.scene) {
          this.scene = new Scene()
          await this.scene.init(side)
        }
        if (!this.physics) {
          this.physics = new Physics()
        }
        if (!this.entities) {
          this.entities = new EntityManager(this.scene, this.physics)
        }

        // Инициализируем input manager с правильной стороной
        this.input = new InputManager(side)

        // Скрываем экран приветствия и показываем игру
        document.getElementById("welcome-screen").style.display = "none"
        document.getElementById("game-container").style.display = "block"

        // Инициализируем сущности
        await this.entities.init(this.network.isHost)

        console.log("Starting game loop...")
        await this.start()
      } catch (error) {
        console.error("Error starting game:", error)
      }
    })

    this.network.on("gameState", (state) => {
      if (state) {
        this.entities.updateFromState(state)
        if (state.ball) {
          this.speedDisplay.update(state.ball)
        }
      }
    })

    this.network.on("opponentLeft", (data) => {
      this.stop()
      // Проверяем наличие data и message
      const message =
        data && data.message ? data.message : "Противник покинул игру"
      alert(`${message}. Вы будете возвращены в лобби.`)
      this.returnToLobby()
    })

    this.network.on("backToLobby", () => {
      this.cleanup()
      this.showLobby()
    })
  }

  returnToLobby() {
    if (this.network.socket) {
      this.network.socket.emit("returnToLobby")
    }
  }

  showLobby() {
    document.getElementById("welcome-screen").style.display = "none"
    document.getElementById("game-container").style.display = "none"
    document.getElementById("lobby-screen").style.display = "flex"
    this.network.requestGames()
  }

  async start() {
    if (!this.isRunning) {
      if (!this.scene) {
        console.error("Scene is not initialized")
        return
      }

      // Убедимся, что сцена инициализирована
      await this.scene.init(this.network.isHost ? "left" : "right")

      this.isRunning = true
      this.gameLoop()
    }
  }

  stop() {
    this.isRunning = false
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  gameLoop() {
    const currentTime = performance.now()
    const deltaTime = (currentTime - this.lastTime) / 1000
    this.lastTime = currentTime

    if (!this.isRunning || !this.scene || !this.entities) return

    try {
      // Обновляем состояние игры
      this.entities.update()

      // Рендерим сцену
      this.scene.render()

      // Планируем следующий кадр
      this.animationFrameId = requestAnimationFrame(() => this.gameLoop())
    } catch (error) {
      console.error("Error in game loop:", error)
      this.stop()
    }
  }

  cleanup() {
    if (this.entities) {
      this.entities.cleanup()
    }
    if (this.input) {
      this.input.cleanup()
    }
    this.isRunning = false
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  destroy() {
    this.stop()
    this.entities.destroy()
    this.input.destroy()
    this.network.disconnect()
    this.scene.destroy()
  }

  setupLobby() {
    const lobbyScreen = document.getElementById("lobby-screen")
    const welcomeScreen = document.getElementById("welcome-screen")
    const gamesList = document.getElementById("games-list")
    const createGameBtn = document.getElementById("create-game")
    const readyButton = document.getElementById("ready-button")

    // Добавляем обработчик для кнопки готовности
    readyButton.addEventListener("click", () => {
      console.log("Ready button clicked")
      this.network.playerReady()
    })

    // Скрываем экран приветствия, показываем лобби
    welcomeScreen.style.display = "none"
    lobbyScreen.style.display = "flex"

    createGameBtn.addEventListener("click", () => {
      console.log("Create game button clicked")
      this.network.createGame()
    })

    this.network.on("gameCreated", (gameId) => {
      console.log("Game created, transitioning to welcome screen")
      lobbyScreen.style.display = "none"
      welcomeScreen.style.display = "flex"
    })

    this.network.on("gameJoined", () => {
      console.log("Game joined, transitioning to welcome screen")
      lobbyScreen.style.display = "none"
      welcomeScreen.style.display = "flex"
    })

    this.network.on("gamesList", (games) => {
      console.log("Updating games list:", games)
      if (!games || games.length === 0) {
        gamesList.innerHTML = '<div class="no-games">Нет доступных игр</div>'
        return
      }

      gamesList.innerHTML = games
        .map(
          (game) => `
        <div class="game-item">
          <div class="game-info">
            <span>Игра #${game.id.slice(0, 6)}</span>
            <span class="game-status">Ожидание игрока</span>
          </div>
          ${
            game.players < game.maxPlayers
              ? `<button class="join-button" data-game-id="${game.id}">Присоединиться</button>`
              : "<span>Игра занята</span>"
          }
        </div>
      `,
        )
        .join("")

      gamesList.querySelectorAll(".join-button").forEach((button) => {
        button.addEventListener("click", () => {
          this.network.joinGame(button.dataset.gameId)
        })
      })
    })

    // Запрашиваем начальный список игр
    this.network.requestGames()
  }
}

// Создаем и запускаем игру
window.addEventListener("DOMContentLoaded", () => {
  console.log("Document loaded, starting game")
  const game = new Game()
  game.init().catch((error) => {
    console.error("Failed to initialize game:", error)
  })
})

// Обработка выхода
window.addEventListener("beforeunload", () => {
  game.destroy()
})
