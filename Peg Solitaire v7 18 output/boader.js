// Based on Daniel Shiffman Flappy Bird
// http://codingtrain.com

let Pub;
let mrate;
let hlayers;


function setglobal(Pub, mutaterate, hiddenlayers) {
  Pub = Pub;
  mrate = mutaterate;
  hlayers = hiddenlayers;
}


function mutate(x) {
  if (random(1) < 0.1) {
    let offset = randomGaussian() * mrate;
    let newx = x + offset;
    return newx;
  } else {
    return x;
  }
}

class CreateBoard {
  constructor(brain, cols, rows) {
    this.pegs = new Array(cols);
    this.nn_input = [];
    this.cols = cols;
    this.rows = rows;
    this.score = 0;
    this.fitness = 0;
    this.falsepegs = 0;
    // console.log(cols + ' ' + rows);
    for (var w = 0; w < rows; w++) {
      this.pegs[w] = new Array(rows);
    }
    for (var w = 0; w < cols; w++) {
      for (var h = 0; h < rows; h++) {
        this.pegs[w][h] = new Peg(w, h);
        this.pegs[w][h].wall = true;

        if ((w < 2 || w > cols - 3) && (h < 2 || h > rows - 3)) {
          this.pegs[w][h].visible = false;
        }
        this.nn_input[w * cols + h] = false;
      }
    }
    //*** Make an tempty Peg in the middle */
    this.pegs[floor(cols / 2)][floor(rows / 2)].wall = false;

    this.falsepegs = new Peg(cols, rows);
    this.falsepegs.wall = true;
    this.falsepegs.visible = false;

    for (var w = 0; w < cols; w++) {
      for (var h = 0; h < rows; h++) {

        this.pegs[w][h].addNeighbors(this.pegs, this.falsepegs);

        this.nn_input[w * cols + h] = (this.pegs[w][h].wall && this.pegs[w][h].visible);
        // ls_input[w * cols + h] = (this.pegs[w][h].wall && this.pegs[w][h].visible);
      }
    }

    if (brain instanceof NeuralNetwork) {
      this.brain = brain.copy();
      this.brain.mutate(mutate);
    } else {

      this.brain = new NeuralNetwork(cols * rows, hlayers, 6);
      // this.brain.activation = tanh;
      // this.brain.setLearningRate(0.1);
    }
  }


  //*** Try prediction
  MovePeg(w, h, md, mv) {
    let tpeg = 0;

    if (this.pegs[w][h].wall === true && this.pegs[w][h].visible === true) {
      tpeg = this.pegs[w][h].neighbors[md];

      if (tpeg && tpeg.wall === true && tpeg.visible === true) {

        if (tpeg.neighbors[md] && tpeg.neighbors[md].wall === false && tpeg.neighbors[md].visible === true) {
          if (mv) {
            this.pegs[w][h].neighbors[md].neighbors[md].wall = true;
            this.pegs[w][h].neighbors[md].wall = false;
            this.pegs[w][h].wall = false;
            this.score++;
          }

          return true;
        }
      }
    }

    return false;
  };

  UpdatePegs() {
    for (var w = 0; w < this.cols; w++) {
      for (var h = 0; h < this.rows; h++) {
        // if ((w < 2 || w > this.cols - 3) && (h < 2 || h > this.rows - 3))

        this.nn_input[w * this.cols + h] = (this.pegs[w][h].wall && this.pegs[w][h].visible);
        // ls_input[w * cols + h] = (this.pegs[w][h].wall && this.pegs[w][h].visible);
      }
    }
  }

  ShowPegs() {
    for (var w = 0; w < this.cols; w++) {
      for (var h = 0; h < this.rows; h++) {

        this.pegs[w][h].show("#335566");
      }
    }
  }

  // Create a copy of this bird
  copy() {
    return new CreateBoard(this.brain, this.cols, this.rows);
  }
}


// An object to describe a Peg in the this.pegs
// Find neighbors 
// wall = Active Peg.
// visible = Active array of the game.

function Peg(w, h) {
  // Location
  this.w = w;
  this.h = h;

  // Neighbors
  this.neighbors = [];

  // Am I a Peg?
  this.wall = true;
  this.visible = true;
  // if (w == 0 & h == 0) {
  //   this.wall = false;
  // }


  // Display me
  this.show = function (col) {
    if (this.wall && this.visible) {
      fill(col);
      stroke(0);
      ellipse(this.w * ww + ww / 2, this.h * hh + hh / 2, ww / 2, hh / 2);
    } else if (this.visible) {
      noFill();
      stroke(0);
      ellipse(this.w * ww + ww / 2, this.h * hh + hh / 2, ww / 2, hh / 2);
    }
  }

  // Figure out who my neighbors are
  // falsepegs = array out the game array

  this.addNeighbors = function (pegs, falsepegs) {
    var w = this.w;
    var h = this.h;
    if (w < cols - 1) {
      this.neighbors.push(pegs[w + 1][h]);
    } else {
      this.neighbors.push(falsepegs);
    }
    if (h < rows - 1) {
      this.neighbors.push(pegs[w][h + 1]);
    } else {
      this.neighbors.push(falsepegs);
    }
    if (w > 0) {
      this.neighbors.push(pegs[w - 1][h]);
    } else {
      this.neighbors.push(falsepegs);
    }
    if (h > 0) {
      this.neighbors.push(pegs[w][h - 1]);
    } else {
      this.neighbors.push(falsepegs);
    }
  }
}