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
let runBrain = 0;
let Games = 0;
let prediction = 0;
let rightpre = 0;


function setup() {
  createCanvas(400, 400);
  console.log('Pin Game');

  runBrainButton = select('#trygame');
  runBrainButton.mousePressed(toggleState);

  Games = select('#Games');
  prediction = select('#prediction');
  rightpre = select('#Answer');
  minpins = select('#MinPins');
  SaveButton = select('#save');
  SaveButton.mousePressed(SaveBrain);
  LoadButton = select('#loadgame');
  LoadButton.mousePressed(LoadBrain);

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

  gamebrian = new NeuralNetwork(cols * rows, (cols * rows) * 2, 3);
}

// Toggle the state of the simulation
function toggleState() {
  runBrain = !runBrain;
  // Show the best bird
  if (runBrain) {
    SetupGame();
    runBrainButton.html('continue training');
    // Go train some more
  } else {
    SetupGame();
    runBrainButton.html('Try Brain');
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
  minpins.html('MinPins:' + mpins);
  wr = floor(random(0, cols));
  hr = floor(random(0, rows));
  grid[wr][hr].wall = false;
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
  let moves = [];
  let nblist = [];
  var fnb = false;
  moves[0] = -1;
  // console.log('step 1');
  // console.log('grid[' + w + '][' + h + ']');
  if (grid[w][h].wall == true) {
    for (var n = 0; n < grid[w][h].neighbors.length; n++) {
      // console.log('grid[' + w + '][' + h + ']' + n);
      if (n > 3) break;
      neighbor = grid[w][h].neighbors[n];
      if (neighbor.wall) {
        if (neighbor.wall === true) {
          if (neighbor.neighbors[n] && neighbor.neighbors[n].wall === false) {
            //*** found a move.
            moveabel = n;
            moves[0] = w;
            moves[1] = h;
            moves[2] = n;
            if (neighbor.neighbors[n].neighbors[n]) {
              for (nn = 0; nn < 3; nn++) {
                if (neighbor.neighbors[n].neighbors[nn].wall === true) {
                  //*** found a better move.
                  fnb = true;
                  break;
                }
              }
            }
            if (fnb) break;
          }
        }
      }
    }
  }
  if (moveabel >= 0) {
    //console.log('w:' + w + 'h:' + h + 'n:' + n);
    rightpre.html('Answer:' + w + ':' + h + ':' + n);

    return moves;
  } else {
    return moves;
  }
}


//*** Try prediction
function TryMovePin(pin_w, pin_h, pinmove, domove) {
  if (grid[pin_w][pin_h].wall === true) {
    if (grid[pin_w][pin_h].neighbors[pinmove] && grid[pin_w][pin_h].neighbors[pinmove].wall === true) {
      if (grid[pin_w][pin_h].neighbors[pinmove].neighbors[pinmove] && grid[pin_w][pin_h].neighbors[pinmove].neighbors[pinmove].wall === false) {

        // grid[pin_w][pin_h].neighbors[pinmove].neighbors[pinmove].wall = true;
        // grid[pin_w][pin_h].neighbors[pinmove].wall = false;
        // grid[pin_w][pin_h].wall = false;
        //console.log("true");
        if (domove == true) {
          grid[pin_w][pin_h].neighbors[pinmove].neighbors[pinmove].wall = true;
          grid[pin_w][pin_h].neighbors[pinmove].wall = false;
          grid[pin_w][pin_h].wall = false;
        }
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
  let ls_input = [];
  let pin_h = 0;
  let pin_w = 0;
  let pinmove = 0;
  let bloop = 0;
  let inputs = 0;

  background(204, 150, 34);

  //**** Convert grid array to line input.
  for (var w = 0; w < rows; w++) {
    for (var h = 0; h < cols; h++) {

      grid[w][h].show(0);

      nn_input[w * cols + h] = grid[w][h].wall;
      ls_input[w * cols + h] = grid[w][h].wall;
    }
  }

  //console.log(nn_input);
  //**** Make a prediction.
  rawprediction = gamebrian.predict(nn_input);


  // console.log(rawprediction);
  //**** Convert prediction grid posion and move direction.
  //*** convert 0-1 to rows
  //*** convert 0-1 to cols
  //*** convert 0-1 to 0-3 moves
  pin_w = round(((rows - 1) / 100) * (rawprediction[0] * 100));
  pin_h = round(((cols - 1) / 100) * (rawprediction[1] * 100));
  pinmove = round(((3) / 100) * (rawprediction[2] * 100));

  bloop = 1; // break loop flag.
  prediction.html('Prediction:' + pin_w + ':' + pin_h + ':' + pinmove)
  //console.log('pin_w:' + pin_w + ' pin_h:' + pin_h + ' pinmove:' + pinmove);

  //*** Try if prediction is posible.
  if (TryMovePin(pin_w, pin_h, pinmove, false) == true) {
    // console.log('Good prediction');
    if (!runBrain) {
      gamebrian.train(nn_input, rawprediction);
    }
    //*** if prediction is good then do move.
    TryMovePin(pin_w, pin_h, pinmove, true);
    bloop = 0;
  } else {
    // console.log('Bad prediction');
    //*** if bad prediction, then find a good move and train brain.
    if (!runBrain) {
      for (var w = 0; w < rows; w++) {
        for (var h = 0; h < cols; h++) {
          // console.log('grid[' + w + '][' + h + ']');
          nn_train = movePin(w, h, false);
          // console.log('Train:' + nn_train);
          if (nn_train[0] > -1) {
            nn_train[0] = nn_train[0] / (rows - 1);
            nn_train[1] = nn_train[1] / (cols - 1);
            nn_train[2] = nn_train[2] / (3);
            // console.log('Train:' + nn_train);
            gamebrian.train(nn_input, nn_train);
            bloop = 0;
            break;
          }
        }
        //*** if no good moves found, the repair for new restart game.
        if (nn_train[0] > -1) {
          break;
        }
      }
    } else {
      inputs = 0;
      // console.log('compare inputs');
      for (i = 0; i < nn_input.length - 1; i++) {
        if (ls_input[i] == nn_input[i]) {
          inputs++;
        }
      }
      // console.log(inputs+' length:'+ nn_input.length);
      if (inputs == nn_input.length - 1) {
        bloop = 1;
      } else {
        bloop = 0;
      }
    }
  }
  if (bloop == 1) {
    SetupGame();
  };
}

function SaveBrain() {
  let json = {};
  json = gamebrian;
  console.log('Save game');

  saveJSON(json, 'GameBrain.json')
}

function getdata(json) {
  let birdBrain = NeuralNetwork.deserialize(json);
  gamebrian = birdBrain;


  SetupGame();
  runBrainButton.html('continue training');
}

function LoadBrain() {
  loadJSON('GameBrain.json', getdata);
}
