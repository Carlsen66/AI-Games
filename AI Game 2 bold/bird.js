// Daniel Shiffman
// Nature of Code: Intelligence and Learning
// https://github.com/shiffman/NOC-S17-2-Intelligence-Learning

// This flappy bird implementation is adapted from:
// https://youtu.be/cXgA1d_E-jY&

// Mutation function to be passed into bird.brain
function mutate(x) {
  if (random(1) < 0.1) {
    let offset = randomGaussian() * 0.5;
    let newx = x + offset;
    return newx;
  } else {
    return x;
  }
}

class Bird {
  constructor(brain) {
    // position and size of bird
    this.x = 20;
    this.y = height / 2;
    this.r = 20;
    this.mx = 0;
    this.my = 0;
    this.lastscore = 0;

    // Gravity, lift and velocity
    this.speed = 1;

    // Is this a copy of another Bird or a new one?
    // The Neural Network is the bird's "brain"
    if (brain instanceof NeuralNetwork) {
      this.brain = brain.copy();
      this.brain.mutate(mutate);
    } else {
      this.brain = new NeuralNetwork(4, 8, 2);
      // this.learning_rate = 0.1;
    }

    // Score is how many frames it's been alive
    this.score = 0;
    // Fitness is normalized version of score
    this.fitness = 0;
  }

  // Create a copy of this bird
  copy() {
    return new Bird(this.brain);
  }

  // Display the bird
  show() {
    fill(216, 231, 27);
    stroke(255);
    ellipse(this.x, this.y, this.r * 2, this.r * 2);
    // image(birdimg, this.x, this.y);
  }

  // This is the key function now that decides
  // if it should jump or not jump!
  think(pipes) {
    // First find the closest pipe
    let closest = null;
    let record = Infinity;
    for (let i = 0; i < pipes.length; i++) {
      let diff = pipes[i].x - this.x;
      if (diff > 0 && diff < record) {
        record = diff;
        closest = pipes[i];
      }
    }

    if (closest != null) {
      // Now create the inputs to the neural network
      let inputs = [];
      // // x position of closest pipe
      inputs[0] = map(closest.x, this.x, width, 0, 1);
      // // top of closest pipe opening
      inputs[1] = map(closest.top, 0, height, 0, 1);
      // // bottom of closest pipe opening
      inputs[2] = map(closest.bottom, 0, height, 0, 1);
      // // bird's y position
      inputs[3] = map(this.y, 0, height, 0, 1);
      // bird's y velocity
      // inputs[1] = map(this.x, 0, width, 0, 1);

      // Get the outputs from the network
      let action = this.brain.predict(inputs);
      // Decide to jump or not!
      // this.speed = 5 //map(action[0], 0, 1, -10, 10) * 5;
      this.mx = map(action[0], 0, 1, -20, 20);
      this.my = map(action[1], 0, 1, -20, 20);
    }
  }


  bottomTop() {
    // Bird dies when hits bottom?
    // this.y > height || this.y < 0 || this.x > width || this.x < 0
    return (this.y > height || this.y < 0 || this.x > width || this.x < 0);
  }

  // Update bird's position based on velocity, gravity, etc.
  update() {
    this.x += this.mx;
    // this.velocity *= 0.9;
    this.y += this.my;
    this.lastscore = this.score;

    // Every frame it is alive increases the score
    if (this.mx > 0.1 || this.mx < -0.1) this.score++;
    if (this.my > 0.1 || this.my < -0.1) this.score++;


    // this.score = map(this.speed, -10, 10, 10, 0, 10);

  }
}