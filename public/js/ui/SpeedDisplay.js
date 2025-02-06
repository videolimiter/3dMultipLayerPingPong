export class SpeedDisplay {
  constructor() {
    this.element = document.createElement('div')
    this.element.style.position = 'absolute'
    this.element.style.top = '20px'
    this.element.style.left = '20px'
    this.element.style.color = 'white'
    this.element.style.fontFamily = 'Arial'
    this.element.style.fontSize = '16px'
    this.element.style.textShadow = '2px 2px 2px black'
    
    document.body.appendChild(this.element)
  }

  update(ballState) {
    if (ballState && ballState.speed !== undefined) {
      this.element.textContent = `Ball Speed: ${Math.round(ballState.speed * 10) / 10}`
    }
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element)
    }
  }
} 