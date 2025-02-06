import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import { GameState } from "./server/GameState.js"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer)

// Раздаем статические файлы из public и shared директорий
app.use(express.static("public"))
app.use("/shared", express.static("shared"))

const gameState = new GameState()
gameState.init() // Инициализируем состояние игры сразу

const TICK_RATE = 64 // Фиксированная частота обновления
const FIXED_TIME_STEP = 1 / TICK_RATE // Фиксированный временной шаг

let gameLoop = null
let players = new Map()
let hostId = null

const MAX_PLAYERS = 2

const games = new Map()

function startGameLoop(gameId) {
  if (!games.has(gameId)) return

  const game = games.get(gameId)
  if (!game.gameLoop) {
    game.lastUpdateTime = Date.now()

    game.gameLoop = setInterval(() => {
      const currentTime = Date.now()
      const deltaTime = FIXED_TIME_STEP // Используем фиксированный шаг

      // Обновляем состояние с фиксированным временным шагом
      const state = game.gameState.update(deltaTime)
      io.to(gameId).emit("gameState", state)

      game.lastUpdateTime = currentTime
    }, 1000 / TICK_RATE)
  }
}

function stopGameLoop(gameId) {
  const game = games.get(gameId)
  if (game && game.gameLoop) {
    clearInterval(game.gameLoop)
    game.gameLoop = null
  }
}

function checkAllPlayersReady(gameId) {
  const game = games.get(gameId)
  if (!game) return false

  let allReady = true
  game.players.forEach((player) => {
    if (!player.ready) allReady = false
  })

  return allReady && game.players.size === MAX_PLAYERS
}

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id)
  console.log("Current hostId:", hostId)

  if (!hostId) {
    hostId = socket.id
    console.log("Setting new hostId:", hostId)
    socket.emit("hostAssignment", true)
  } else {
    socket.emit("hostAssignment", false)
  }

  socket.on("playerReady", () => {
    // Находим игру, в которой находится игрок
    let playerGame = null
    for (const [gameId, game] of games.entries()) {
      if (game.players.has(socket.id)) {
        playerGame = game
        break
      }
    }

    if (!playerGame) {
      socket.emit("error", "Игра не найдена")
      return
    }

    // Отмечаем игрока как готового
    const player = playerGame.players.get(socket.id)
    player.ready = true

    // Проверяем готовность всех игроков
    if (checkAllPlayersReady(playerGame.id)) {
      console.log("All players ready, starting game")
      startGameLoop(playerGame.id) // Запускаем цикл для конкретной игры
      io.to(playerGame.id).emit("gameStart")
    }
  })

  socket.on("playerMove", (data) => {
    // Находим игру игрока
    for (const [gameId, game] of games.entries()) {
      if (game.players.has(socket.id)) {
        const player = game.gameState.players.get(socket.id)
        if (player) {
          player.setInput(data)
        }
        break
      }
    }
  })

  socket.on("ballSync", (data) => {
    if (socket.id === hostId) {
      socket.broadcast.emit("ballSync", data)
    }
  })

  socket.on("scoreUpdate", (data) => {
    if (socket.id === hostId) {
      io.emit("scoreUpdate", data)
    }
  })

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id)

    // Находим игру игрока
    for (const [gameId, game] of games.entries()) {
      if (game.players.has(socket.id)) {
        // Останавливаем игровой цикл этой игры
        stopGameLoop(gameId)
        game.gameState.cleanup()

        // Удаляем игрока
        game.players.delete(socket.id)

        if (game.players.size === 0) {
          games.delete(gameId)
          io.emit("gameRemoved", gameId)
        } else {
          io.to(gameId).emit("opponentLeft", {
            message: "Противник покинул игру",
          })
        }
        break
      }
    }

    // Сбрасываем хост
    hostId = null

    // Очищаем список игроков
    players.clear()
  })

  socket.on("returnToLobby", () => {
    const player = players.get(socket.id)
    if (player) {
      player.ready = false
      socket.emit("backToLobby")
    }
  })

  socket.on("ready", () => {
    const player = players.get(socket.id)
    if (player) {
      player.ready = true

      // Проверяем, готовы ли все игроки
      if (checkAllPlayersReady()) {
        // Запускаем игру
        io.emit("gameStart")
      }
    }
  })

  // Отправляем список игр новому клиенту
  socket.on("requestGames", () => {
    const gamesList = Array.from(games.values())
      .filter((game) => game.players.size < MAX_PLAYERS) // Только игры с свободными местами
      .map((game) => ({
        id: game.id,
        players: game.players.size,
        maxPlayers: MAX_PLAYERS,
      }))
    socket.emit("gamesList", gamesList)
  })

  // Создание новой игры
  socket.on("createGame", () => {
    console.log("Create game request from:", socket.id)

    // Проверяем, не создал ли уже этот игрок игру
    for (const [_, game] of games.entries()) {
      if (game.players.has(socket.id)) {
        socket.emit("error", "Вы уже создали игру")
        return
      }
    }

    const gameId = socket.id
    const newGame = {
      id: gameId,
      players: new Map(),
      gameState: new GameState(),
    }

    newGame.gameState.init() // Инициализируем состояние игры
    newGame.gameState.addPlayer(socket.id, "left") // Добавляем первого игрока

    newGame.players.set(socket.id, {
      id: socket.id,
      isHost: true,
      side: "left",
      ready: false,
    })

    games.set(gameId, newGame)
    socket.join(gameId) // Добавляем игрока в комнату
    socket.emit("gameCreated", gameId)

    console.log("Game created:", gameId)
    socket.emit("gameCreated", gameId)

    // Обновляем список игр для всех
    io.emit(
      "gamesList",
      Array.from(games.values()).map((game) => ({
        id: game.id,
        players: game.players.size,
        maxPlayers: MAX_PLAYERS,
      })),
    )
  })

  // Присоединение к игре
  socket.on("joinGame", (gameId) => {
    const game = games.get(gameId)
    if (game && game.players.size < MAX_PLAYERS) {
      game.players.set(socket.id, {
        id: socket.id,
        isHost: false,
        side: "right",
        ready: false,
      })

      game.gameState.addPlayer(socket.id, "right") // Добавляем второго игрока
      socket.join(gameId) // Добавляем игрока в комнату
      socket.emit("gameJoined")
    } else {
      socket.emit("error", "Невозможно присоединиться к игре")
    }
  })
})

const PORT = process.env.PORT || 3000
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
