class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseWorldX = 0;
    this.mouseWorldY = 0;
    this.lastSendX = 0;
    this.lastSendY = 0;

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    });

    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  updateWorldCoords(camera) {
    if (!camera) return;
    this.mouseWorldX = camera.screenToWorldX(this.mouseX);
    this.mouseWorldY = camera.screenToWorldY(this.mouseY);
  }

  shouldSend() {
    const dx = this.mouseWorldX - this.lastSendX;
    const dy = this.mouseWorldY - this.lastSendY;
    return Math.sqrt(dx * dx + dy * dy) > 0.5;
  }

  markSent() {
    this.lastSendX = this.mouseWorldX;
    this.lastSendY = this.mouseWorldY;
  }
}
