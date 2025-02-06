import { io } from "socket.io-client"

export class NetworkManager {
  constructor() {
    this.socket = null
    this.isHost = false
    this.id = null
    this.eventHandlers = new Map()
    this.currentGameId = null
  }

  async connect() {
    return new Promise((resolve) => {
      if (this.socket) {
        resolve()
        return
      }

      this.socket = io()

      this.socket.on("connect", () => {
        this.id = this.socket.id
        this.setupBaseHandlers()
        resolve()
      })

      // Обработчики для лобби
      this.socket.on("gamesList", (games) => {
        console.log("Received games list:", games)
        if (this.eventHandlers.has("gamesList")) {
          this.eventHandlers.get("gamesList")(games)
        }
      })

      this.socket.on("gameCreated", (gameId) => {
        console.log("Game created:", gameId)
        this.currentGameId = gameId
        this.isHost = true
        if (this.eventHandlers.has("gameCreated")) {
          this.eventHandlers.get("gameCreated")(gameId)
        }
      })

      this.socket.on("gameJoined", (gameId) => {
        this.currentGameId = gameId
        this.isHost = false
        if (this.eventHandlers.has("gameJoined")) {
          this.eventHandlers.get("gameJoined")(gameId)
        }
      })

      this.socket.on("error", (message) => {
        console.error("Server error:", message)
        alert(message)
      })
    })
  }

  setupBaseHandlers() {
    this.socket.on("gameStart", () => {
      console.log("Game starting!")
      if (this.eventHandlers.has("gameStart")) {
        this.eventHandlers.get("gameStart")()
      }
    })

    this.socket.on("opponentJoined", (data) => {
      if (this.eventHandlers.has("opponentJoined")) {
        this.eventHandlers.get("opponentJoined")(data)
      }
    })

    this.socket.on("opponentLeft", () => {
      if (this.eventHandlers.has("opponentLeft")) {
        this.eventHandlers.get("opponentLeft")()
      }
    })

    this.socket.on("opponentMoved", (data) => {
      if (this.eventHandlers.has("opponentMoved")) {
        this.eventHandlers.get("opponentMoved")(data)
      }
    })

    this.socket.on("ballSync", (data) => {
      if (this.eventHandlers.has("ballSync")) {
        this.eventHandlers.get("ballSync")(data)
      }
    })

    this.socket.on("scoreUpdate", (data) => {
      if (this.eventHandlers.has("scoreUpdate")) {
        this.eventHandlers.get("scoreUpdate")(data)
      }
    })

    this.socket.on("gameState", (state) => {
      if (this.eventHandlers.has("gameState")) {
        this.eventHandlers.get("gameState")(state)
      }
    })
  }

  // Методы для отправки данных
  async playerReady() {
    if (!this.socket) {
      await this.connect()
    }
    this.socket.emit("playerReady")
  }

  sendBallSync(data) {
    if (this.isHost) {
      this.socket.emit("ballSync", data)
    }
  }

  sendScore(scores) {
    if (this.isHost) {
      this.socket.emit("scoreUpdate", scores)
    }
  }

  sendPlayerInput(input) {
    if (this.socket && this.socket.connected) {
      const direction = input || 0
      console.log("Sending input to server:", direction)
      this.socket.emit("playerMove", direction)
    }
  }

  // Обработка событий
  on(event, handler) {
    this.eventHandlers.set(event, handler)
  }

  off(event) {
    this.eventHandlers.delete(event)
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
    }
  }

  requestGames() {
    if (this.socket && this.socket.connected) {
      this.socket.emit("requestGames")
    }
  }

  createGame() {
    console.log("Sending createGame request")
    if (this.socket && this.socket.connected) {
      this.socket.emit("createGame")
    } else {
      console.error("Socket not connected")
    }
  }

  joinGame(gameId) {
    this.socket.emit("joinGame", gameId)
  }
}
