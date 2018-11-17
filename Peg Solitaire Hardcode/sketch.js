// How many columns and rows?
var cols = 7;
var rows = 7;

// This will be the 2D array
// var grid = new Array(cols);


let speedSlider;
let speedSpan;
let g = 0;


// How big is the population
let totalPopulation = 10000;
let hiddenlayers = 0;
let mutaterate = 0;

// All active Peg boards 
let activePegboards = [];
// All Peg boards for any given population
let allPegBoards = [];

let tempBestPegBoard = 0;

let highScoreSpan = 0;
let allTimeHighScoreSpan = 0;
let highScore = 0;


// Training or just showing the current best
let runBest = false;
let astep = 0;
let runBestButton;
let BestPegBoard;
let bestpegsleft = 99;

// let wa = [];
// let ha = [];
// let na = [0, 1, 2, 3];


function setup() {
  // setglobal(totalPopulation, mutaterate, hiddenlayers);

  createCanvas(400, 400);
  console.log('Peg Game');

  runBestButton = select('#bestbrain');
  runBestButton.mousePressed(toggleState);
  Info = select('#Info');
  Info.html('HL:' + hiddenlayers + ' MR:' + mutaterate + ' Pub:' + totalPopulation)

  Games = select('#Games');
  highScoreSpan = select('#highscore');
  allTimeHighScoreSpan = select('#allhighscore');
  activepeg = select('#activepeg');
  learning = select('#learning');
  SaveButton = select('#save');
  SaveButton.mousePressed(SaveBrain);
  LoadButton = select('#loadgame');
  LoadButton.mousePressed(LoadBrain);
  // Fbg = select('#Fbg');
  // Fbg.mousePressed(FindbestGame);
  speedSlider = select('#speedSlider');
  speedSpan = select('#speed');

  // Grid cell size
  ww = width / cols;
  hh = height / rows;

  // Create a population
  for (let i = 0; i < totalPopulation; i++) {
    let newboard = new CreateBoard(cols, rows);
    activePegboards[i] = newboard;
    allPegBoards[i] = newboard;
  }
}

// Toggle the state of the simulation
function toggleState() {
  runBest = !runBest;
  // Show the best bird
  if (runBest) {
    // SetupGame();
    runBestButton.html('continue training');
    // Go train some more
  } else {
    // SetupGame();
    runBestButton.html('Try Brain');
  }
}


function draw() {
  let pegsleft = 99;
  let nn_train = [];

  let cycles = speedSlider.value();

  speedSpan.html(cycles);
  setFrameRate(cycles);
  // console.log(cycles);

  background("#34888C");

  // console.log("draw start")
  if (!runBest) {
    if (speedSlider.value() <= 59) {

      activePegboards[0].ShowPegs();
    }
    for (let i = activePegboards.length - 1; i >= 0; i--) {
      // ha = shuffle(ha);
      // na = shuffle(na);

      nn_train = FindMove(activePegboards[i]);
      // console.log(nn_train)
      if (nn_train[0] > -1) {
        if (activePegboards[i].MovePeg(nn_train[0], nn_train[1], nn_train[2], true)===false) {
          activePegboards.splice(i, 1);
        } else {
          pegsleft = activePegboards[i].UpdatePegs();
          activePegboards[i].steps.push(nn_train);

          let ta = activePegboards[i].wa.shift();
          activePegboards[i].wa.push(ta);

          
          if (pegsleft === 1) {

            BestPegBoard = activePegboards[i];
            SaveBrain();
            // noLoop();

          }
          // console.log("Good move")
        }
      } else {
        activePegboards.splice(i, 1);
      }
    }
  } else {
    BestPegBoard.ShowPegs();

    w = BestPegBoard.steps[astep][0]
    h = BestPegBoard.steps[astep][1]
    n = BestPegBoard.steps[astep][2]
    console.log('w ' + w + ' h ' + h + ' n ' + n)
    if (BestPegBoard.MovePeg(w, h, n, true) == false) {
      console.log('runbest step fejl');
    }
    if (astep < BestPegBoard.steps.length-1) astep++;
    // if (astep >0) astep--;
  }
  activepeg.html('Active:' + activePegboards.length);
  // console.log('active:' + activePegboards.length);

  // What is highest score of the current population
  let tempHighScore = 0;
  // If we're training
  if (!runBest) {
    // Which is the best bird?
    let tempBestPegBoard = null;
    for (let i = 0; i < activePegboards.length; i++) {
      let s = activePegboards[i].score;
      if (s > tempHighScore) {
        tempHighScore = s;
        tempBestPegBoard = activePegboards[i];
      }
    }
    // Is it the all time high scorer?

    if (tempHighScore > highScore) {
      highScore = tempHighScore;
      BestPegBoard = tempBestPegBoard;
      // console.log(BestPegBoard);
    }
  } else {
    // Just one bird, the best one so far
    tempHighScore = BestPegBoard.score;
    if (tempHighScore > highScore) {
      highScore = tempHighScore;
    }
  }
  // Update DOM Elements
  highScoreSpan.html('HighScore:' + tempHighScore);
  allTimeHighScoreSpan.html('TotHighScore:' + highScore);

  if (pegsleft < bestpegsleft) bestpegsleft = pegsleft;
  learning.html('PegsLeft:' + bestpegsleft);

  if (activePegboards.length == 0) {
    nextGeneration();
    g++;
    Games.html('Games:' + g);
  }
}

function FindMove(board) {
  let nn_train = [];
  let mu = 0
  let md = 0
  let ml = 0
  let mr = 0
  let w = 0
  let h = 0
  let offset = 0
  let result = 0;
  nn_train[0] = -1;

  //*** if bad prediction, then find a good move and train brain.
  if (random(1) > 0.3) {
    while (result == 0) {
      w = mr + offset - ml
      h = md + offset - mu

      // console.log('w ' + w + ' h ' + h + 'offest ' + offset)
      for (var n = 0; n < 4; n++) {
        result = board.MovePeg(w, h, n, false);
        if (result === true) {
          nn_train[0] = w;
          nn_train[1] = h;
          nn_train[2] = n;
          return nn_train;
        }
      }
      if (mr + offset < board.rows - 1 - offset) {
        mr++;
      } else {
        if (md + offset < board.cols - 1 - offset) {
          md++;
        } else {
          if (ml + offset < board.rows - 1 - offset) {
            ml++;
          } else {
            if (mu + offset < board.cols - 1 - offset) {
              mu++;
            } else {
              mr = 0
              ml = 0
              mu = 0
              md = 0;
              if (offset < board.rows - 1) {
                offset++;
              } else {
                break;
              }
            }
          }
        }
      }
    }
  } else {
    for (w = 0; w < rows; w++) {
      for (h = 0; h < cols; h++) {
        for (n = 0; n < 4; n++) {

          if (board.MovePeg(board.wa[w], board.ha[h], board.na[n], false) === true) {
            nn_train[0] = board.wa[w];
            nn_train[1] = board.ha[h];
            nn_train[2] = board.na[n];
            return nn_train;
          }
        }
      }
    }
  }
  return nn_train;
}

// for (var w = 0; w < rows; w++) {
//   for (var h = 0; h < cols; h++) {
//     for (var n = 0; n < 4; n++) {
//       if (board.MovePeg(w, h, n, false) === true) {
//         nn_train[0] = w;
//         nn_train[1] = h;
//         nn_train[2] = n;
//         return nn_train;
//       }
//       // if (board.MovePeg(board.wa[w], board.ha[h], board.na[n], false) === true) {
//       //   nn_train[0] = board.wa[w];
//       //   nn_train[1] = board.ha[h];
//       //   nn_train[2] = board.na[n];
//       //   return nn_train;

//       // }
//     }
//   }
// }
// return nn_train;


function SaveBrain() {
  let json = {};
  json = BestPegBoard.steps;
  console.log('Save game');

  saveJSON(json, 'PegSteps_' + Date() + '.json')
}

function getdata(json) {
  let brain = (json);
  console.log(brain);
  BestPegBoard = new CreateBoard(cols, rows);
  BestPegBoard.steps = brain;
  speedSlider.value(2);
  astep = 0;

  runBest = true;
  runBestButton.html('Running Best');
}

function LoadBrain() {
  loadJSON('GameBrain.json', getdata);
}