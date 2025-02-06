export class InputManager {
  constructor(side) {
    this.side = side
    this.keys = {
      ArrowLeft: false,
      ArrowRight: false,
    }
    this.lastDirection = 0
    this.game = window.game
    this.setupKeyboardHandlers()
  }

  setupKeyboardHandlers() {
    document.addEventListener("keydown", (e) => {
      if (this.keys.hasOwnProperty(e.code) && !this.keys[e.code]) {
        this.keys[e.code] = true
        this.emitInputChange()
      }
    })

    document.addEventListener("keyup", (e) => {
      if (this.keys.hasOwnProperty(e.code) && this.keys[e.code]) {
        this.keys[e.code] = false
        this.emitInputChange()
      }
    })
  }

  emitInputChange() {
    const direction = this.getMovementInput()
    console.log(
      "Current direction:",
      direction,
      "Last direction:",
      this.lastDirection,
    )
    if (direction !== this.lastDirection) {
      this.lastDirection = direction
      console.log("Direction changed, sending to server:", direction)
      if (this.game && this.game.network) {
        this.game.network.sendPlayerInput(direction)
      } else {
        console.error("Game or network not available")
      }
    }
  }

  getMovementInput() {
    let direction = 0
    if (this.keys.ArrowLeft) direction -= 1
    if (this.keys.ArrowRight) direction += 1
    return direction
  }

  destroy() {
    document.removeEventListener("keydown", this.handleKeyDown)
    document.removeEventListener("keyup", this.handleKeyUp)
  }
}
