// Bested on Daniel Shiffman Flappy Bird
// http://codingtra.wn

// Mutation function to be passed into bird.brain

function mutate(x) {
  if (random(1) < 0.1) {
    let offset = randomGaussian() * mrate;
    let newx = x + offset;
    return newx;
  } else {
    return x;
  }
}

function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = floor(random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

class CreateBoard {
  constructor(cols, rows) {
    this.pegs = new Array(cols);
    this.nn_input = [];
    this.cols = cols;
    this.rows = rows;
    this.falsepegs = 0;
    this.steps = [];
    this.score = 0;
    this.scount = 0;
    // this.brain = new NeuralNetwork(cols * rows, 50, 3);

  }

  SetupPegs() {
    console.log('SetupPegs()');
    this.steps = [];
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

    // this.pegs[floor((cols / 2))][floor(rows / 2)+2].wall = false;
    // this.pegs[floor((cols / 2))][floor(rows / 2)+1].wall = false;
    this.pegs[floor((cols / 2))][floor(rows / 2)].wall = false;

    this.falsepegs = new Peg(cols, rows);
    this.falsepegs.wall = true;

    for (var w = 0; w < cols; w++) {
      for (var h = 0; h < rows; h++) {

        this.pegs[w][h].addNeighbors(this.pegs, this.falsepegs);

        this.nn_input[w * cols + h] = (this.pegs[w][h].wall && this.pegs[w][h].visible);
        // ls_input[w * cols + h] = (this.pegs[w][h].wall && this.pegs[w][h].visible);
      }
    }
  }
  //*** Try prediction
  MovePeg(w, h, md, mv) {
    let tpeg = 0;
    let moves = [];

    if (this.pegs[w][h].wall === true && this.pegs[w][h].visible === true) {
      tpeg = this.pegs[w][h].neighbors[md];

      if (tpeg && tpeg.wall === true && tpeg.visible === true) {

        if (tpeg.neighbors[md] && tpeg.neighbors[md].wall === false && tpeg.neighbors[md].visible === true) {
          if (mv) {
            this.pegs[w][h].neighbors[md].neighbors[md].wall = true;
            this.pegs[w][h].neighbors[md].wall = false;
            this.pegs[w][h].wall = false;
            this.score++;
            moves[0] = w;
            moves[1] = h;
            moves[2] = md;
            this.steps.push(moves);
          }

          return true;
        }
      }
    }

    return false;
  };

  UpdatePegs() {
    let count = 0;
    for (var w = 0; w < this.cols; w++) {
      for (var h = 0; h < this.rows; h++) {
        // if ((w < 2 || w > this.cols - 3) && (h < 2 || h > this.rows - 3))

        this.nn_input[w * this.cols + h] = (this.pegs[w][h].wall && this.pegs[w][h].visible);
        if (this.nn_input[w * this.cols + h] == true) {
          count++
        }
        // ls_input[w * cols + h] = (this.pegs[w][h].wall && this.pegs[w][h].visible);
      }
    }
    return count;
  }


  ShowPegs() {
    background(38, 121, 189);
    for (var w = 0; w < this.cols; w++) {
      for (var h = 0; h < this.rows; h++) {

        this.pegs[w][h].show("#E8AE02");
      }
    }
  }

  // Create a copy of this bird
  copy() {
    let twa = this.wa;
    let tha = this.ha;
    let tna = this.na;
    let newpeg = new CreateBoard(this.cols, this.rows);

    newpeg.ha = tha;
    newpeg.wa = twa;
    newpeg.na = tna;

    let sel = random(1);
    if (sel > 0.8) {
      newpeg.wa = shuffle(newpeg.wa);
    } else if (sel > 0.4) {
      let th = newpeg.ha.shift();
      newpeg.ha.push(th);
    } else if (sel > 0.2) {
      newpeg.ha = shuffle(newpeg.ha);
    } else {
      newpeg.na = shuffle(newpeg.na);
    }
    // console.log('wa:'+newpeg.wa)
    // console.log('wa:'+newpeg.na+' twa:'+tna)

    return newpeg;
  }
}


// An object to describe a Peg in the this.pegs
function Peg(w, h) {
  // Location
  this.w = w;
  this.h = h;

  // Neighbors
  this.neighbors = [];

  // Am I a wall?
  this.wall = true;
  this.visible = true;
  if (w == 0 & h == 0) {
    this.wall = false;
  }


  // Display me
  this.show = function (col) {
    strokeWeight(2);
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