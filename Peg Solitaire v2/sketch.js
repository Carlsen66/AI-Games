// How many columns and rows?
var cols = 7;
var rows = 7;

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
let wa = [];
let ha = [];
let pre_right = 0;
let pre_fail = 0;
let speedSlider;
let speedSpan;
let wr = 1;
let hr = 0;
let lpins = 200;


let moves = { pw: 0, py: 0, pm: 0 };
let goodmoves = [];
let goodgames = [];
let startpos = [];
let findbest = false;


function setup() {
  createCanvas(400, 400);
  console.log('Pin Game');

  runBrainButton = select('#trygame');
  runBrainButton.mousePressed(toggleState);

  Games = select('#Games');
  prediction = select('#prediction');
  rightpre = select('#Answer');
  minpins = select('#MinPins');
  learning = select('#learning');
  SaveButton = select('#save');
  SaveButton.mousePressed(SaveBrain);
  LoadButton = select('#loadgame');
  LoadButton.mousePressed(LoadBrain);
  Fbg = select('#Fbg');
  Fbg.mousePressed(FindbestGame);
  speedSlider = select('#speedSlider');
  speedSpan = select('#speed');

  //setFrameRate(1);

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

  gamebrian = new NeuralNetwork(cols * rows, (cols * rows) * 3, 3);
  SetupGame();
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

// Toggle the state of the simulation
function FindbestGame() {
  findbest = !findbest;
  // Show the best bird
  if (!findbest) {
    SetupGame();
    Fbg.html('Findbest');
  } else {
    SetupGame();
    Fbg.html('AI');
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

function SetupGame() {
  let mpins = 0;
  gamebrian = new NeuralNetwork(cols * rows, (cols * rows) * 3, 3);
  g++;
  // console.log('Game:' + g);
  Games.html('Games:' + g);

  for (var w = 0; w < cols; w++) {
    wa[w] = w;
    for (var h = 0; h < rows; h++) {
      ha[h] = h;

      if (grid[w][h].wall == true) {
        mpins++;
      }
      grid[w][h].wall = true;
    }
  }
  for (var w = 0; w < cols; w++) {
    for (var h = 0; h < rows; h++) {
      if ((w < 2 || w > cols - 3) && (h < 2 || h > rows - 3)) grid[w][h].visible = false;
    }
  }
  grid[floor(cols / 2)][floor(rows / 2)].wall = false;

  if(mpins < lpins) {
    if(mpins != 1) gamebrian.mutate(mutate);
    lpins = mpins;
    console.log(lpins);
  }
  else {
    gamebrian.mutate(mutate);
  }
  

  minpins.html('MinPins:' + mpins);
  if (mpins == 1) {
    goodgames.push(goodmoves);
    let sp = { wr: wr, hr: hr };
    startpos.push(sp);
    goodmoves = [];

    console.log("goodgame");
  } else {
    goodmoves = [];

  }

  for (var w = 0; w < cols; w++) {
    wa[w] = w;
    for (var h = 0; h < rows; h++) {
      ha[h] = h;
    }
  }
  // if (findbest) {
    wa = shuffle(wa);
    ha = shuffle(ha);
  // }
  // console.log(wa);
  // console.log(ha);
  // All the neighbors
  for (var w = 0; w < cols; w++) {
    for (var h = 0; h < rows; h++) {
      grid[w][h].addNeighbors(grid);
    }
  }
}

function draw() {

  let rawprediction = 0;
  let nn_input = [];
  // let nn_train = [];
  let ls_input = [];
  let pin_h = 0;
  let pin_w = 0;
  let pinmove = 0;
  let bloop = 0;
  let inputs = 0;

  let cycles = speedSlider.value();
  speedSpan.html(cycles);
  setFrameRate(cycles);
  // console.log(cycles);

  background("#34888C");

  //**** Convert grid array to line input.
  for (var w = 0; w < rows; w++) {
    for (var h = 0; h < cols; h++) {
      if (speedSlider.value() <= 59) {
        grid[w][h].show("#335566");
      }
      nn_input[w * cols + h] = (grid[w][h].wall && grid[w][h].visible);
      ls_input[w * cols + h] = (grid[w][h].wall && grid[w][h].visible);
    }
  }

  //console.log(nn_input);
  //**** Make a prediction.
  if (findbest != true) {
    rawprediction = gamebrian.predict(nn_input);
  }

  // console.log("1");
  //console.log(rawprediction);
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
  if (findbest != true) {
    if (TryMovePin(pin_w, pin_h, pinmove, true) == true) {
      // console.log('Good prediction');
      if (!runBrain) {
        pre_right++;
        moves = { pw: pin_w, py: pin_h, pm: pinmove };
        goodmoves.push(moves);
        
        bloop = 0;
      }
      
    } else {
      // console.log('Bad prediction');
      //*** if bad prediction, then find a good move and train brain.
    }
  } else {
    //console.log("3");
    let md = [0, 1, 2, 3];
    md = shuffle(md);

    for (var w = 0; w < rows; w++) {
      for (var h = 0; h < cols; h++) {
        //console.log('grid[' + wa[i] + '][' + ha[i] + ']');

        for (var m = 0; m < md.length; m++) {
          //console.log("5");
          if (TryMovePin(wa[w], ha[h], md[m], true)) {
            moves = { pw: wa[w], py: ha[h], pm: md[m] };
            goodmoves.push(moves);
            bloop = 0;
            break;
          }
        }
        if (bloop == 0) {
          break;
        }

      }
      if (bloop == 0) {
        break;
      }
    }
  }
  // console.log(pre_fail+' '+pre_right);
  learning.html('Learning rate:' + round((pre_right / pre_fail) * 100));
  if (bloop == 1) {
    SetupGame();
  }
}

//*** Find a good move or do good a move.
function movePin(w, h) {
  let moveabel = -1;
  let moves = [];
  moves[0] = -1;
  // console.log('step 1');
  // console.log('grid[' + w + '][' + h + ']');
  if (grid[w][h].wall == true) {
    for (var n = 0; n < grid[w][h].neighbors.length; n++) {
      // console.log('grid[' + w + '][' + h + ']' + n);
      if (n > 3) break;
      neighbor = grid[w][h].neighbors[n];
      if (neighbor.wall) {
        if (neighbor.wall === true && neighbor.visible === true) {
          if (neighbor.neighbors[n] && neighbor.neighbors[n].wall === false && neighbor.neighbors[n].visible === true) {
            //*** found a move.
            moveabel = n;
            moves[0] = w;
            moves[1] = h;
            moves[2] = n;
            if (neighbor.neighbors[n].neighbors[n]) {
              for (nn = 0; nn < 3; nn++) {
                if (neighbor.neighbors[n].neighbors[nn].wall === true && neighbor.neighbors[n].visible === true) {
                  //*** found a better move.
                  fnb = true;
                  break;
                }
              }
            }
            if (fnb) break;
            break;
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
    if (grid[pin_w][pin_h].neighbors[pinmove] && grid[pin_w][pin_h].neighbors[pinmove].wall === true && grid[pin_w][pin_h].neighbors[pinmove].visible === true) {
      if (grid[pin_w][pin_h].neighbors[pinmove].neighbors[pinmove] && grid[pin_w][pin_h].neighbors[pinmove].neighbors[pinmove].wall === false && grid[pin_w][pin_h].neighbors[pinmove].visible === true) {

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
