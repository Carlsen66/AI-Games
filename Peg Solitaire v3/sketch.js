// How many columns and rows?
var cols = 7;
var rows = 7;

// This will be the 2D array
// var grid = new Array(cols);


let speedSlider;
let speedSpan;
let g = 0;


// How big is the population
let totalPopulation = 1000;
// All active Peg boards 
let activePegboards = [];
// All Peg boards for any given population
let allPegBoards = [];

let tempBestPegBoard = 0;

let highScoreSpan=0;
let allTimeHighScoreSpan=0;
let highScore=0;


// Training or just showing the current best
let runBest = false;
let runBestButton;
let BestPegBoard;


function setup() {
  createCanvas(400, 400);
  console.log('Peg Game');

  runBestButton = select('#bestbrain');
  runBestButton.mousePressed(toggleState);

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
    let newboard = new CreateBoard(0, cols, rows);
    activePegboards[i] = newboard;
    allPegBoards[i] = newboard;
  }
  // setFrameRate(10);
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
  let rawprediction = 0;

  let cycles = speedSlider.value();

  speedSpan.html(cycles);
  setFrameRate(cycles);
  // console.log(cycles);

  background("#34888C");


  // for (let i = 0; i < totalPopulation; i++) {
  if (speedSlider.value() <= 59) {
    // for (let i = 0; i < activePegboards.length; i++) {
    // if (activePegboards[i].fitness > 0.001) {
    activePegboards[0].ShowPegs();
    // }
    // }
  }

  for (let i = activePegboards.length - 1; i >= 0; i--) {

    rawprediction = activePegboards[i].brain.predict(activePegboards[i].nn_input);
    // console.log(rawprediction);
    //**** Convert prediction grid posion and move direction.
    //*** convert 0-1 to rows
    //*** convert 0-1 to cols
    //*** convert 0-1 to 0-3 moves
    pin_w = round(((rows - 1) / 100) * (rawprediction[0] * 100));
    pin_h = round(((cols - 1) / 100) * (rawprediction[1] * 100));
    pinmove = round(((3) / 100) * (rawprediction[2] * 100));

    // if(pin_w == 3 && pin_h == 1 && pinmove == 1) console.log('311 good prediction');
    // if(pin_w == 1 && pin_h == 3 && pinmove == 0) console.log('130 good prediction');
    // if(pin_w == 3 && pin_h == 5 && pinmove == 3) console.log('353 good prediction');
    // if(pin_w == 5 && pin_h == 3 && pinmove == 2) console.log('532 good prediction');

    if (activePegboards[i].MovePeg(pin_w, pin_h, pinmove) != true) {
      activePegboards.splice(i, 1);
    } else {
      activePegboards[i].UpdatePegs();
      // console.log(activePegboards[i].nn_input)
    }
    // prediction.html('Prediction:' + pin_w + ':' + pin_h + ':' + pinmove);
    // console.log('Prediction:' + pin_w + ':' + pin_h + ':' + pinmove);

  }
  activepeg.html('Active:' + activePegboards.length);
  console.log('active:'+activePegboards.length);

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


  if (activePegboards.length == 0) {
    nextGeneration();
    g++;
    Games.html('Games:' + g);
  }
}



function SaveBrain() {
  let json = {};
  json = BestPegBoard.brain;
  console.log('Save game');

  saveJSON(json, 'GameBrain.json')
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