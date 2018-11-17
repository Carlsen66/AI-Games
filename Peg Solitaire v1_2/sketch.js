// How many columns and rows?
var cols = 7;
var rows = 7;

// This will be the 2D array
// var grid = new Array(cols);


let speedSlider;
let speedSpan;
let g = 0;


// How big is the population
let totalPopulation = 20000;
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
    let newboard = new CreateBoard(cols, rows, false);
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

  if (speedSlider.value() <= 59) {

    activePegboards[0].ShowPegs();
  }

  for (let i = activePegboards.length - 1; i >= 0; i--) {


    nn_train = FindMove(activePegboards[i]);

    if (nn_train[0] > -1) {
      if (activePegboards[i].MovePeg(nn_train[0], nn_train[1], nn_train[2], true) != true) {
        activePegboards.splice(i, 1);
      } else {
        pegsleft = activePegboards[i].UpdatePegs();

        // let ta = activePegboards[i].wa.shift();
        // activePegboards[i].wa.push(ta);

        activePegboards[i].steps.push(nn_train);
        if (pegsleft == 1) {

          BestPegBoard = activePegboards[i];
          SaveBrain();
        }
        // console.log("Good move")
      }
    } else {
      activePegboards.splice(i, 1);
    }
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
  nn_train[0] = -1;

  //*** if bad prediction, then find a good move and train brain.

  for (var w = 0; w < rows; w++) {
    for (var h = 0; h < cols; h++) {
      for (var n = 0; n < 4; n++) {
        let wp = board.plade[w * board.cols + h];
        let hp = board.plade[(board.plade.length- 1) - (w * board.cols + h)];

        if (board.MovePeg(wp, hp, board.na[n], false) === true) {
          nn_train[0] = wp;
          nn_train[1] = hp;
          nn_train[2] = board.na[n];
          return nn_train;
        }
      }
    }
  }
  return nn_train;
}

function SaveBrain() {
  let json = {};
  json = BestPegBoard.steps;
  console.log('Save game');

  saveJSON(json, 'PegSteps_' + Date() + '.json')
}

function getdata(json) {
  let birdBrain = NeuralNetwork.deserialize(json);
  gamebrian = birdBrain;


  SetupGame();
  runBestButton.html('continue training');
}

function LoadBrain() {
  loadJSON('GameBrain.json', getdata);
}