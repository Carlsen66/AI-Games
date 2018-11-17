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
let trybrain = false;
let train = false;
let astep = 0;
let TryBrainButton;
let BestPegBoard;
let TrainPegBoard;
let TestPegBoard;
let trainactiv = false;
let bestpegsleft = 99;
let brain;

// let wa = [];
// let ha = [];
// let na = [0, 1, 2, 3];

var dataset = [];
let data = [];

function getdatafile(json) {
  data = json;
  dataset.push(data);
  // console.log(dataset[0]);
}

function preload() {
  for (let i = 1; i < 36; i++) {
    loadJSON('data/data (' + i + ').json', getdatafile);
  }
}

function setup() {
  // setglobal(totalPopulation, mutaterate, hiddenlayers);

  createCanvas(400, 400);
  console.log('Peg Game');

  TryBrainButton = select('#bestbrain');
  TryBrainButton.mousePressed(toggleState);
  Info = select('#Info');
  // Info.html('HL:' + hiddenlayers + ' MR:' + mutaterate + ' Pub:' + totalPopulation)

  Games = select('#Games');
  highScoreSpan = select('#highscore');
  allTimeHighScoreSpan = select('#allhighscore');
  activepeg = select('#activepeg');
  learning = select('#learning');
  SaveButton = select('#save');
  SaveButton.mousePressed(SaveBrain);
  LoadButton = select('#loadgame');
  LoadButton.mousePressed(LoadBrain);
  TrainButton = select('#train');
  TrainButton.mousePressed(TrainBrain);
  speedSlider = select('#speedSlider');
  speedSpan = select('#speed');

  // Grid cell size
  ww = width / cols;
  hh = height / rows;

  TrainPegBoard = new CreateBoard(cols, rows);

  // brain = new NeuralNetwork(cols * rows, 14, 3);
  


}

// Toggle the state of the simulation
function toggleState() {
  trybrain = !trybrain;
  // Show the best bird
  if (trybrain) {
    // SetupGame();
    TestPegBoard.SetupPegs();
    TryBrainButton.html('Testing Brain');
    // Go train some more
  } else {
    // SetupGame();
    TryBrainButton.html('Try Brain');
  }
}

function TrainBoarder(data) {
  let nn_train = [];
  console.log('Training');
  for (let i = 0; i < data.length; i++) {
    // console.log(data[i]);
    let moves = data[i];
    nn_train[0] = moves[0] / (rows - 1);
    nn_train[1] = moves[1] / (cols - 1);
    nn_train[2] = moves[2] / (3);

    brain.train(TrainPegBoard.nn_input, nn_train);
    if (TrainPegBoard.MovePeg(moves[0], moves[1], moves[2], true) === true) {
      TrainPegBoard.UpdatePegs();
    } else {
      console.log('game error');
    }
  }
}

function TrainBrain() {
  train = !train;
  if (train) {
    TrainButton.html('training');
    trainactiv = true;
    speedSlider.value(60);
  } else TrainButton.html('Train')
}

let traincounter = 0;

function draw() {
  let pegsleft = 99;
  let nn_train = [];

  let cycles = speedSlider.value();

  speedSpan.html(cycles);
  setFrameRate(cycles);
  // console.log(cycles);

  background("#34888C");


  if (trainactiv) {
    data = dataset[traincounter];
    TrainPegBoard.SetupPegs();
    TrainBoarder(data);
    // if (traincounter < dataset.length - 1) {
      if (traincounter < 2) {
      traincounter++
    } else {
      trainactiv = train;
      // TrainBrain();
      traincounter = 0;
      TrainPegBoard.SetupPegs();
      TestPegBoard = TrainPegBoard;
      console.log('Training rund end.')
    }
  }

  if (trybrain) {
    speedSlider.value(3);
    if (speedSlider.value() <= 59) {

      TestPegBoard.ShowPegs();
    }
    rawprediction = brain.predict(TestPegBoard.nn_input);

    //*** Convert prediction grid posion and move direction.
    //*** convert 0-1 to rows
    //*** convert 0-1 to cols
    //*** convert 0-1 to 0-3 moves
    console.log(rawprediction[0], rawprediction[1], rawprediction[2]);
    pin_w = round(((rows - 1) / 100) * (rawprediction[0] * 100));
    pin_h = round(((cols - 1) / 100) * (rawprediction[1] * 100));
    pinmove = round(((3) / 100) * (rawprediction[2] * 100));

    // nn_train = FindMove(TestPegBoard);
    console.log(pin_w, pin_h, pinmove);

    if (TestPegBoard.MovePeg(pin_w, pin_h, pinmove, true) === false) {
      console.log('somthing went wrong !!!!')
    } else {
      pegsleft = TestPegBoard.UpdatePegs();

      if (pegsleft === 1) {

        BestPegBoard = TestPegBoard;
        SaveBrain();
      }
    }
  }

  // activepeg.html('Active:' + activePegboards.length);
  // console.log('active:' + activePegboards.length);

  // What is highest score of the current population
  // let tempHighScore = 0;
  // If we're training
  // if (!TryBrain) {
  //   // Which is the best bird?
  //   let tempBestPegBoard = null;
  //   for (let i = 0; i < activePegboards.length; i++) {
  //     let s = TestPegBoard.score;
  //     if (s > tempHighScore) {
  //       tempHighScore = s;
  //       tempBestPegBoard = TestPegBoard;
  //     }
  //   }
  //   // Is it the all time high scorer?

  //   if (tempHighScore > highScore) {
  //     highScore = tempHighScore;
  //     BestPegBoard = tempBestPegBoard;
  //     // console.log(BestPegBoard);
  //   }
  // } else {
  //   // Just one bird, the best one so far
  //   tempHighScore = BestPegBoard.score;
  //   if (tempHighScore > highScore) {
  //     highScore = tempHighScore;
  //   }
  // }
  // // Update DOM Elements
  // highScoreSpan.html('HighScore:' + tempHighScore);
  // allTimeHighScoreSpan.html('TotHighScore:' + highScore);

  // if (pegsleft < bestpegsleft) bestpegsleft = pegsleft;
  // learning.html('PegsLeft:' + bestpegsleft);

  // if (activePegboards.length == 0) {
  //   nextGeneration();
  //   g++;
  //   Games.html('Games:' + g);
  // }
}


function SaveBrain() {
  let json = {};
  json = brain;
  console.log('Save game');

  saveJSON(json, 'PegBrain_' + Date() + '.json')
}

function getdata(json) {
  TestPegBoard = TrainPegBoard;
  brain = NeuralNetwork.deserialize(json);
  speedSlider.value(3);

  trybrain = true;
  TryBrainButton.html('Running Best');
}

function LoadBrain() {
  loadJSON('GameBrain.json', getdata);
}