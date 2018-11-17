let activeGuns = []
let allGuns = []
let bestGun = []
let gunfire = []
let count = 0
let keyOn = 0
let runBest = 0
let highScoreSpan;
let allTimeHighScoreSpan;
// All time high score
let highScore = 0;

let bm = 30

const BOMBSCORE = 30
const BOMBLOST = 200
const STARTSCORE = 100
const BOMBHITGUN = 200

// Mutation function to be passed into Gun.brain
function mutate(x) {
  if (random(1) < 0.1) {
    let offset = randomGaussian() * 0.5;
    let newx = x + offset;
    return newx;
  } else {
    return x;
  }
}

function setup() {
  createCanvas(400, 600);
  console.log('Drop Bumb')
  for (let i = 0; i < 500; i++) {
    let b = []
    for (let i = 0; i < 3; i++) {
      b[i] = new Bomb(bm + i * 50)
    }
    let g = new Gun()
    g.bumbs = b
    activeGuns[i] = g
    allGuns[i] = g
  }
  bestGun = activeGuns[0]
  // Access the interface elements
  speedSlider = select('#speedSlider');
  speedSpan = select('#speed');
  highScoreSpan = select('#hs');
  allTimeHighScoreSpan = select('#ahs');
  runBestButton = select('#best');
  runBestButton.mousePressed(RunBestOnOff);
  SaveButton = select('#save');
  SaveButton.mousePressed(SaveBestGun);
  LoadButton = select('#load');
  LoadButton.mousePressed(LoadBestGun);
}

class Bomb {
  constructor(pos) {
    this.x = pos //random(10, width - 10)
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
        console.log('Bomb hit')
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
    this.gamescore = STARTSCORE
    this.bumbs = []
    this.fire = []
    this.games = 0

    // Is this a copy of another Gun or a new one?
    // The Neural Network is the Gun's "brain"
    if (brain instanceof NeuralNetwork) {
      this.brain = brain.copy();
      this.brain.mutate(mutate);
    } else {
      this.brain = new NeuralNetwork(7, 6, 1);
      // this.learning_rate = 0.1;
    }
  }

  // Create a copy of this Gun
  copy() {
    return new Gun(this.brain);
  }

  move(dir) {
    if (!dir == 0) this.dir = dir
    if (this.x > 10 && this.x < width - 30) {
      this.x += this.dir
    }

  }

  show() {
    fill(200)
    rect(this.x, this.y, this.w, this.w)
  }

  think() {
    // Now create the inputs to the neural network
    let inputs = [];
    for (let i = 0; i < 6; i++) inputs[i] = 0;

    for (let i = 0; i < this.bumbs.length; i++) {
      const element = this.bumbs[i];
      let j = i * 2
      inputs[j] = map(element.x, 0, width, 0, 1);
      // 
      inputs[j + 1] = map(element.y, 0, height, 0, 1);
      // 
    }
    inputs[6] = map(this.x, 0, width, 0, 1);
    // console.log(inputs)
    // Get the outputs from the network
    let action = this.brain.predict(inputs);
    // 
    // if (action[0] > action[1] && action[0] > 0.8) this.move(-5)
    // if (action[0] < action[1] && action[1] > 0.8) this.move(5)
    if (action[0] < 0.4) this.move(-7)
    if (action[0] > 0.6) this.move(7)
    //this.score -= 1
  }
}

class Gunfire {
  constructor(gun) {
    this.x = gun.x + (gun.w / 2)
    this.y = gun.y
  }

  hits(gun) {
    for (let i = 0; i < gun.bumbs.length; i++) {
      if ((this.x >= gun.bumbs[i].x - (gun.bumbs[i].w / 2)) && (this.x < gun.bumbs[i].x + (gun.bumbs[i].w / 2))) {
        if ((this.y < gun.bumbs[i].y + 10) && (this.y > gun.bumbs[i].y - 10)) {
          console.log('gunbullet hit')
          gun.score += 1
          gun.gamescore += BOMBSCORE
          gun.bumbs.splice(i, 1)
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

function RunBestOnOff() {
  runBest = !runBest;
  if (runBest) {
    resetGame();
    runBestButton.html('continue training');
    // Go train some more
  } else {
    nextGeneration();
    runBestButton.html('run best');
  }
}

function keyPressed() {
  if (keyCode == LEFT_ARROW) {
    activeGuns[0].move(-5)
  } else if (keyCode === RIGHT_ARROW) {
    activeGuns[0].move(5)
  }
  keyOn = true
}

function keyReleased() {
  keyOn = false
}

function draw() {
  let bumbehit = 0
  background(0)

  // Should we speed up cycles per frame
  let cycles = speedSlider.value();
  speedSpan.html(cycles);

  if (runBest) {
    bestGun.show()
    for (let i = 0; i < bestGun.bumbs.length; i++) {
      bestGun.bumbs[i].show()
    }
    for (let j = 0; j < bestGun.fire.length; j++) {
      bestGun.fire[j].show()
    }
  } else {
    activeGuns[0].show()
    for (let i = 0; i < activeGuns[0].bumbs.length; i++) {
      activeGuns[0].bumbs[i].show()
    }
    for (let j = 0; j < activeGuns[0].fire.length; j++) {
      activeGuns[0].fire[j].show()
    }
  }
  for (n = 0; n < cycles; n++) {

    //*** Loop all Guns game */
    for (let i = activeGuns.length - 1; i >= 0; i--) {

      //*** Create a new Gunfire
      if (count > 8) {
        let fire = new Gunfire(activeGuns[i])
        activeGuns[i].fire.push(fire)
      }
      //**** Loop GunFire Hit */ 
      for (let j = 0; j < activeGuns[i].fire.length; j++) {
        // activeGuns[i].fire[j].show()
        activeGuns[i].fire[j].update()
        activeGuns[i].fire[j].hits(activeGuns[i])
        if (activeGuns[i].fire[j].y < 0) {
          activeGuns[i].fire.splice(i, 1)
        }
      }
      //*** Crate new bumbs */
      if (activeGuns[i].bumbs.length == 0) {
        for (let j = 0; j < 3; j++) {
          activeGuns[i].bumbs[j] = new Bomb(bm + j * 50)
        }
        activeGuns[i].games += 1
        // activeGuns[i].gamescore = STARTSCORE
        bm += 20
        if (bm > 250) bm = 30
      }
      //*** Loop Bumbs Hit */
      for (let j = 0; j < activeGuns[i].bumbs.length; j++) {
        // activeGuns[i].bumbs[j].show()
        bumbehit = activeGuns[i].bumbs[j].hits(activeGuns[i])
        if (bumbehit) {
          activeGuns[i].gamescore -= BOMBHITGUN
        }
        if (activeGuns[i].bumbs[j].update() > height) {
          // console.log('kill bomb')
          activeGuns[i].bumbs.splice(i, 1)
          activeGuns[i].gamescore -= BOMBLOST
        }
      }
      // if (keyOn) activeGuns[i].move(0)
      //*** Gun Brain */
      if (!bumbehit && activeGuns[i].gamescore > 0) {
        activeGuns[i].think()
      } else {
        activeGuns.splice(i, 1)
        // console.log('Guns ' + activeGuns.length)
      }
    }
    // What is highest score of the current population
    let tempHighScore = 0;
    // If we're training
    if (!runBest) {
      // Which is the best Gun?
      let tempBestGun = null;
      for (let i = 0; i < activeGuns.length; i++) {
        let s = activeGuns[i].gamescore;
        if (s > tempHighScore) {
          tempHighScore = s;
          tempBestGun = activeGuns[i];
        }
      }

      // Is it the all time high scorer?
      if (tempHighScore > highScore) {
        highScore = tempHighScore;
        bestGun = tempBestGun;
      }
    } else {
      // Just one Gun, the best one so far
      tempHighScore = bestGun.score;
      if (tempHighScore > highScore) {
        highScore = tempHighScore;
      }
    }

    // Update DOM Elements
    highScoreSpan.html(tempHighScore);
    allTimeHighScoreSpan.html(highScore);
    if (activeGuns.length == 0) {
      console.log('New Game')
      nextGeneration();
    }
    count++
    if (count > 9) count = 0
  }
}

function SaveBestGun() {
  let json = {};
  json = bestGun.brain;

  saveJSON(json, 'GunBrain.json')
}

function getdata(json) {
  let GunBrain = NeuralNetwork.deserialize(json);
  bestGun.brain = GunBrain;

  runBest = true;
  resetGame();
  runBestButton.html('continue training');
}

function LoadBestGun() {
  loadJSON('GunBrain.json', getdata);
}