let bombs = []
let gun = 0
let gunfire = []
let count = 0
let keyOn = 0

function setup() {
  createCanvas(400, 600);
  console.log('Drop Bumb')
  for (let i = 0; i < 3; i++) {
    bombs[i] = new Bomb()
  }
  gun = new Gun()

}

class Bomb {
  constructor() {
    this.x = random(10, width - 10)
    this.y = -5
    this.speed = 5
    this.w = 20

  }
  update() {
    this.y += this.speed
    return this.y
  }
  show() {
    fill(255)
    ellipse(this.x, this.y, this.w)
  }

  hits(gun) {
    if ((this.y >= gun.y)) {
      if ((this.x >= gun.x - 10) && (this.x < gun.x + 30)) {
        console.log('hit')
        return true
      }
    }
    return false
  }
}

class Gun {
  constructor(brain) {
    this.x = width / 2
    this.y = height - 30
    this.w = 20
    this.dir = 0
    this.fitness = 0
    this.score = 0

    // Is this a copy of another Bird or a new one?
    // The Neural Network is the bird's "brain"
    if (brain instanceof NeuralNetwork) {
      this.brain = brain.copy();
      this.brain.mutate(mutate);
    } else {
      this.brain = new NeuralNetwork(7, 6, 2);
      // this.learning_rate = 0.1;
    }
  }

  move(dir) {
    if (!dir == 0) this.dir = dir
    if (this.x > 0 && this.x < width - 20) {
      this.x += this.dir
    }

  }

  show() {
    fill(200)
    rect(this.x, this.y, this.w, this.w)
    this.score += 1
  }

  think(bumbs) {
    // Now create the inputs to the neural network
    let inputs = [];
    for (let i = 0; i < bumbs.length; i++) {
      const element = bumbs[i];
      let j = i * 2
      inputs[j] = map(element.x, 0, width, 0, 1);
      // 
      inputs[j + 1] = map(element.y, 0, height, 0, 1);
      // 
    }
    inputs[6] = map(this.x, 0, width, 0, 1);
    console.log(inputs)
    // Get the outputs from the network
    let action = this.brain.predict(inputs);
    // 
    if (action[0] > action[1]) gun.move(-5)
    if (action[0] < action[1]) gun.move(5)
  }
}

class GunFire {
  constructor(gun) {
    this.x = gun.x + (gun.w / 2)
    this.y = gun.y
  }

  hits(bumbs) {
    for (let i = 0; i < bumbs.length; i++) {
      if ((this.x >= bumbs[i].x - (bombs[i].w / 2)) && (this.x < bumbs[i].x + (bombs[i].w / 2))) {
        if ((this.y < bumbs[i].y + 10) && (this.y > bumbs[i].y - 10)) {
          console.log('gunbullet hit')
          gun.score += 10
          bumbs.splice(i, 1)
        }
      }
    }
  }

  update() {
    this.y -= 10
  }

  show() {
    fill(255, 0, 0)
    ellipse(this.x, this.y, 5, 5)
  }
}

function keyPressed() {
  if (keyCode == LEFT_ARROW) {
    gun.move(-5)
  } else if (keyCode === RIGHT_ARROW) {
    gun.move(5)
  }
  keyOn = true
}

function keyReleased() {
  keyOn = false
}

function draw() {
  background(0)
  for (let i = 0; i < bombs.length; i++) {
    bombs[i].show()
    bombs[i].hits(gun)

    if (bombs[i].update() > height) {
      console.log('kill bomb')
      bombs.splice(i, 1)
    }
  }
  if (bombs.length == 0) {
    for (let i = 0; i < 3; i++) {
      bombs[i] = new Bomb()
    }

  }
  if (keyOn) gun.move(0)

  gun.think(bombs)
  gun.show()
  if (count > 20) {
    let fire = new GunFire(gun)
    gunfire.push(fire)
    count = 0
  }
  for (let i = 0; i < gunfire.length; i++) {
    gunfire[i].show()
    gunfire[i].update()
    gunfire[i].hits(bombs)
    if (gunfire[i].y < 0) {
      gunfire.splice(i, 1)
    }
  }
  count++
}