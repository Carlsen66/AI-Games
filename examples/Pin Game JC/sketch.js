// How many columns and rows?
var cols = 4;
var rows = 4;

// This will be the 2D array
var grid = new Array(cols);

// Width and height of each cell of grid
var w, h;

let sc = 0;
let sr = 0;
let falsegrid = 0;
let gamebrian = 0;
let g = 0;
let runBest = 0;
let Games = 0;
let prediction = 0;
let rightpre = 0;


function setup() {
  createCanvas(400, 400);
  console.log('Pin Game');

  runBestButton = select('#trygame');
  Games = select('#Games');
  prediction = select('#prediction');
  rightpre = select('#anser');
  minpins = select('#MinPins');
  runBestButton.mousePressed(toggleState)

  //setFrameRate(5);

  // Grid cell size
  ww = width / cols;
  hh = height / rows;

  // Making a 2D array
  for (var w = 0; w < rows; w++) {
    grid[w] = new Array(rows);
  }

  for (var w = 0; w < cols; w++) {
    for (var h = 0; h < rows; h++) {
      grid[w][h] = new Spot(w, h);
    }
  }
  falsegrid = new Spot(cols, rows);
  falsegrid.wall = true;

  //grid[0][2].wall = false;

  gamebrian = new NeuralNetwork(cols * rows, cols * rows, 1);
}

// Toggle the state of the simulation
function toggleState() {
  runBest = !runBest;
  // Show the best bird
  if (runBest) {
    SetupGame();
    runBestButton.html('continue training');
    // Go train some more
  } else {
    SetupGame();
    runBestButton.html('Try Game');
  }
}

function SetupGame() {
  g++;
  //console.log('Game:' + g);
  Games.html('Games:' + g);

  let mpins = 0;
  for (var w = 0; w < cols; w++) {
    for (var h = 0; h < rows; h++) {
      if (grid[w][h].wall == true) {
        mpins++;
      }
      grid[w][h].wall = true;
    }
  }
  minpins.html('MinPins' + mpins);
  wr = floor(random(0, cols));
  hr = floor(random(0, rows));
  grid[0][0].wall = false;
  // All the neighbors
  for (var w = 0; w < cols; w++) {
    for (var h = 0; h < rows; h++) {
      grid[w][h].addNeighbors(grid);
    }
  }

}

//*** Find a good move or do good a move.
function movePin(w, h, domove) {
  let moveabel = -1;
  let moves = 0;
  // console.log('step 1');
  //console.log('grid[' + i + '][' + j + ']' + n);
  if (grid[w][h].wall == true) {
    for (var n = 0; n < grid[w][h].neighbors.length; n++) {
      console.log('grid[' + w + '][' + h + ']' + n);
      if(n>3) break;
      neighbor = grid[w][h].neighbors[n];
      if (neighbor.wall) {
        if (neighbor.wall === true) {
          if (neighbor.neighbors[n] && neighbor.neighbors[n].wall === false) {
            moveabel = n;
            if (neighbor.neighbors[n].neighbors[n] && neighbor.neighbors[n].neighbors[n].wall == true) {
              //   //console.log('found one');
              //*** Found at better move.
              moveabel = n;
              console.log(n);
              // }
              break;
            }
          }
        }
      }
    }
    if (moveabel >= 0) {
      n = moveabel;
      // console.log(moveabel);
      // n = moveabel[floor(random(0, moveabel.length - 1))];
      // //console.log(n);
      if (domove == true) {
        grid[w][h].neighbors[n].neighbors[n].wall = true;
        grid[w][h].neighbors[n].wall = false;
        grid[w][h].wall = false;
      }
      //console.log('w:' + w + 'h:' + h + 'n:' + n);
      rightpre.html('Anser:' + w + ':' + h + ':' + n);
      moves = ((w * 4) + (h * cols * 4)) + n;
      //console.log('Moves:' + moves);
      return (moves / (4 * (rows * cols) / 100)) / 100;
    } else {
      return -1;
    }
  }
}

//*** Try prediction
function TryMovePin(pin_w, pin_h, pinmove) {
  if (grid[pin_w][pin_h].wall === true) {
    if (grid[pin_w][pin_h].neighbors[pinmove] && grid[pin_w][pin_h].neighbors[pinmove].wall === true) {
      if (grid[pin_w][pin_h].neighbors[pinmove].neighbors[pinmove] && grid[pin_w][pin_h].neighbors[pinmove].neighbors[pinmove].wall === false) {

        grid[pin_w][pin_h].neighbors[pinmove].neighbors[pinmove].wall = true;
        grid[pin_w][pin_h].neighbors[pinmove].wall = false;
        grid[pin_w][pin_h].wall = false;
        //console.log("true");
        return true;

      }
    }
  }
  return false;
}

function draw() {
  let predicted = 0;
  let rawprediction = 0;
  let nn_input = [];
  let nn_train = [];
  let pin_h = 0;
  let pin_w = 0;
  let pinmove = 0;
  let bloop = 0;

  background(255);

  //**** Convert grid array to line input.
  for (var w = 0; w < rows; w++) {
    for (var h = 0; h < cols; h++) {

      grid[w][h].show(0);

      nn_input[w * cols + h] = grid[w][h].wall;
    }
  }

  //console.log(nn_input);
  //**** Make a prediction.
  rawprediction = gamebrian.predict(nn_input);

  //**** Convert prediction grid posion and move direction.
  predicted = (rawprediction * 100) + 0.3;
  //console.log('predicted:' + predicted);
  predicted = floor((4 * (rows * cols) / 100) * predicted);
  pin_h = 0;
  pin_w = floor(predicted / 4);
  pinmove = predicted - (4 * floor(predicted / 4));
  pin_h = floor(pin_w / (rows));
  pin_w = pin_w - (pin_h * (rows));


  bloop = 1; // break loop flag.
  prediction.html('prediction:' + pin_w + ':' + pin_h + ':' + pinmove)
  //console.log('pin_w:' + pin_w + ' pin_h:' + pin_h + ' pinmove:' + pinmove);

  //*** Try if prediction is posible.
  if (TryMovePin(pin_w, pin_h, pinmove) == true) {
    console.log('Good prediction');
    nn_train[0] = rawprediction;
    if (!runBest) {
      gamebrian.train(nn_input, nn_train);
    }
    //*** if prediction is good then do move.
    movePin(pin_w, pin_h, true);
    bloop = 0;
  } else {
    console.log('Bad prediction');
    //*** if bad prediction, then find a good move and train brain.
    if (!runBest) {
      for (var w = 0; w < rows; w++) {
        for (var h = 0; h < cols; h++) {
          nn_train[0] = movePin(w, h, false);
          if (nn_train[0] > 0) {
            //console.log('Train:' + nn_train);
            gamebrian.train(nn_input, nn_train);
            bloop = 0;
            break;
          }
        }
        //*** if no good moves found, the repair for new restart game.
        if (nn_train[0] > 0) {
          break;
        }
      }
    } else bloop = 0;
  }

  if (bloop == 1) {
    SetupGame();
  };
}
