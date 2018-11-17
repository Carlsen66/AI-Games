// How many columns and rows?
var cols = 7;
var rows = 7;

// This will be the 2D array
// var grid = new Array(cols);


let speedSlider;
let speedSpan;
let g = 0;

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
let domove = false;
var dataset = [];
let data = [];
let brain_input;
let numofbrain = 0;
let traincounter = 0;
let brainfail = 0;
let setmove = true;
let step = 0
let sw = 0
let sh = 0
let sd = 0
let ud = 0
let lr = 0
let hm = 0;
let wm = 0;
let count = 0;
let mouseXY = [];



function getdatafile(json) {
  data = json;
  dataset.push(data);
  // console.log(dataset[0]);
}

function preload() {
  for (let i = 1; i < 72; i++) {
    loadJSON('data2/data (' + i + ').json', getdatafile);
  }
}

function setup() {
  createCanvas(400, 400);
  console.log('Peg Game');

  TryBrainButton = select('#bestbrain');
  TryBrainButton.mousePressed(toggleState);
  Info = select('#Info');
  // Info.html('HL:' + hiddenlayers + ' MR:' + mutaterate + ' Pub:' + totalPopulation)

  Games = select('#Games');
  Tcount = select('#traincount');
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
  background("#83E801");

  TrainPegBoard = new CreateBoard(cols, rows);
  TrainPegBoard.SetupPegs();
  TrainPegBoard.ShowPegs();
  numofbrain = 70;
  brain_input = (cols * rows) * numofbrain;
  brain = new NeuralNetwork(brain_input, 20, 3);
}

function mousePressed() {
  let mx = floor(map(mouseX, 0, width, 0, cols));
  let my = floor(map(mouseY, 0, height, 0, rows));
  let md = 0;
  fill(233);
  if (mouseXY.length > 0) {
    if (mx > mouseXY[0] && my == mouseXY[1]) md = 0;
    if (mx == mouseXY[0] && my > mouseXY[1]) md = 1;
    if (mx < mouseXY[0] && my == mouseXY[1]) md = 2;
    if (mx == mouseXY[0] && my < mouseXY[1]) md = 3;
    console.log(mouseXY[0], mouseXY[1], md)
    if (TrainPegBoard.MovePeg(mouseXY[0], mouseXY[1], md, true) == true) {
      background("#83E801");
      TrainPegBoard.UpdatePegs();
      TrainPegBoard.ShowPegs();
    } else {
      console.log('error!')
    }
    mouseXY = [];
  } else {
    mouseXY[0] = mx;
    mouseXY[1] = my;
    ellipse(mouseXY[0] * ww + ww / 2, mouseXY[1] * hh + hh / 2, ww / 2, hh / 2);
  }
  // console.log(x, y)

  // prevent default
  return false;
}

// Toggle the state of the simulation
function toggleState() {
  trybrain = !trybrain;

  // Show the best 
  if (trybrain) {
    train = !trybrain;
    // SetupGame;
    TestPegBoard.SetupPegs();
    TryBrainButton.html('Testing Brain');
    speedSlider.value(15);
    // Go train some more
  } else {
    TryBrainButton.html('Try Brain');
  }
}

function FillInput(posion, binput) {
  let nn_input = [];

  for (let j = 0; j < posion; j++) {
    for (i = 0; i < (rows * cols); i++) {
      nn_input.push(0);
    }
  }
  for (let j = 0; j < binput.length; j++) {
    nn_input.push(binput[j]);
  }
  datalen = nn_input.length;

  for (let i = datalen; i < brain_input; i++) {
    nn_input.push(0);
  }
  return nn_input;
}

function TrainBoarder(data, posion) {
  let nn_train = [];
  let nn_input = [];

  nn_input = FillInput(posion, TrainPegBoard.nn_input);

  // console.log(nn_input);
  // console.log('Training');
  for (let i = 0; i < data.length; i++) {
    // console.log(data[i]);
    let moves = data[i];
    nn_train[0] = moves[0] / (rows - 1);
    nn_train[1] = moves[1] / (cols - 1);
    nn_train[2] = moves[2] / (3);

    // nn_input.push(TrainPegBoard.nn_input);

    brain.train(nn_input, nn_train);
    if (TrainPegBoard.MovePeg(moves[0], moves[1], moves[2], true) === true) {
      TrainPegBoard.UpdatePegs();
      nn_input = FillInput(posion, TrainPegBoard.nn_input);
    } else {
      console.log('game error');
    }
  }
}

function TrainBrain() {
  train = !train;

  if (train) {
    ount = 0;
    trybrain = !train;
    TrainButton.html('training');
    trainactiv = true;
    speedSlider.value(60);
  } else TrainButton.html('Train')
}



function draw() {
  let cycles = speedSlider.value();
  let nn_input = [];

  speedSpan.html(cycles);
  setFrameRate(cycles);
  // console.log(cycles);

  //******************* */
  //*** Train brain  */
  if (trainactiv) {
    data = dataset[traincounter];

    TrainPegBoard.SetupPegs();
    TrainBoarder(data, traincounter);
    // if (traincounter < dataset.length - 1) {
    if (traincounter < numofbrain - 1) {
      traincounter++
    } else {
      trainactiv = train;
      // TrainBrain();
      traincounter = 0;
      TrainPegBoard.SetupPegs();
      TestPegBoard = TrainPegBoard;
      console.log('Training rund end.');
      count++;
      Tcount.html('Counter:' + count);

    }
  }

  if (domove) {
    if (setmove) {
      step = TestPegBoard.steps[TestPegBoard.steps.length - 1];
      sw = step[0];
      sh = step[1];
      sd = step[2];
      ud = 0
      lr = 0
      hm = 0;
      wm = 0;
      count = 0;
      setmove = false;
    }
    // console.log(sw, sh, sd, lr, ud);
    switch (sd) {
      case 0:
        lr = 15;
        break;
      case 1:
        ud = 15;
        break;
      case 2:
        lr = -15;
        break;
      case 3:
        ud = -15;
        break;
    }
    fill(255, 0, 0, 150);
    stroke(0);
    ellipse(sw * ww + wm + ww / 2, sh * hh + hm + hh / 2, ww / 2, hh / 2);

    wm = wm + lr;
    hm = hm + ud;
    count++;
    if (count > 5) {
      domove = false;
      setmove = true;
      if (pegsleft === 1) {
        TestPegBoard.SetupPegs();
        traincounter++;
        if (traincounter > numofbrain - 1) traincounter = 0;
        console.log(traincounter);
      }
    }

  } else if (trybrain) {

    if (speedSlider.value() <= 59) {
      background("#83E801");
      TestPegBoard.ShowPegs();
    }
    nn_input = FillInput(traincounter, TestPegBoard.nn_input)
    rawprediction = brain.predict(nn_input);

    //*** Convert prediction grid posion and move direction.
    //*** convert 0-1 to rows
    //*** convert 0-1 to cols
    //*** convert 0-1 to 0-3 moves
    // console.log(rawprediction[0], rawprediction[1], rawprediction[2]+' s2:'+rawprediction[3], rawprediction[4], rawprediction[5]);
    pin_w = round(((rows - 1) / 100) * (rawprediction[0] * 100));
    pin_h = round(((cols - 1) / 100) * (rawprediction[1] * 100));
    pinmove = round(((3) / 100) * (rawprediction[2] * 100));

    // nn_train = FindMove(TestPegBoard);
    console.log(pin_w, pin_h, pinmove);

    if (TestPegBoard.MovePeg(pin_w, pin_h, pinmove, true) === false) {
      console.log('somthing went wrong !!!!');
      traincounter++;
      if (traincounter >= numofbrain - 1) {
        traincounter = brainfail;
        if (brainfail < numofbrain - 1) {
          brainfail++;
          console.log('brainfail ' + brainfail);
          TestPegBoard.SetupPegs();
        } else {
          brainfail = 0;
        }

      }
      console.log(traincounter);
      // pin_w = round(((rows - 1) / 100) * (rawprediction[3] * 100));
      // pin_h = round(((cols - 1) / 100) * (rawprediction[4] * 100));
      // pinmove = round(((3) / 100) * (rawprediction[5] * 100));
      // console.log(pin_w, pin_h, pinmove);
      // if (TestPegBoard.MovePeg(pin_w, pin_h, pinmove, true) === false) {
      //   console.log('somthing went wrong 22 !!!!');
      //   traincounter++;

      // }
    } else {
      domove = true;
      pegsleft = TestPegBoard.UpdatePegs();

      if (pegsleft === 1) {

        BestPegBoard = TestPegBoard;
        // SaveBrain();
      }
    }
    Games.html('Game Moves:' + TestPegBoard.steps.length)
  }
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

  TestPegBoard.SetupPegs();
  speedSlider.value(15);

  trybrain = true;
  TryBrainButton.html('Running');
}

function LoadBrain() {
  loadJSON('GameBrain.json', getdata);
}