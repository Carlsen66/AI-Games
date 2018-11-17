// Daniel Shiffman
// Nature of Code: Intelligence and Learning
// https://github.com/shiffman/NOC-S17-2-Intelligence-Learning

// This flappy bird implementation is adapted from:
// https://youtu.be/cXgA1d_E-jY&

class Pipe {
  constructor() {

    // Top and bottom of pipe
    this.top = random(120, height - 120);
    this.bottom = random(this.top + 20, 80);
    // Starts at the edge
    this.x = random(100, width - 100);
    // Width of pipe
    this.w = random(20, 100);
  }

  // Did this pipe hit a bird?
  hits(bird) {
    if ((bird.y - bird.r) < this.top || (bird.y + bird.r) > (height - this.bottom)) {
      if (bird.x > this.x && bird.x < this.x + this.w) {
        return true;
      }
    }
    return false;
  }

  // Draw the pipe
  show() {
    stroke(255);
    fill(76, 86, 95);
    rect(this.x, this.bottom, this.w, this.top);
    // rect(this.x, height - this.bottom, this.w, this.bottom);
  }

  // Update the pipe
  update() {
    this.x -= this.speed;
  }

  // Has it moved offscreen?
  offscreen() {
    if (this.x < -this.w) {
      return true;
    } else {
      return false;
    }
  }
}