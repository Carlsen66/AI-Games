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
let TestPegBoard;
let trainactiv = false;
let brain;
let domove = false;
var dataset = [];
let data = [];
let brain_input;
let numofbrain = 0;
let movecount = 0;
let aicount = 0;
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
let mycanvas

function setup() {
  mycanvas = createCanvas(400, 400);
  mycanvas.parent('rcorners2')
  console.log('Peg Game');

  TryBrainButton = select('#bestbrain');
  TryBrainButton.mousePressed(toggleState);
  ResetButton = select('#reset');
  ResetButton.mousePressed(SetupGame);
  speedSlider = select('#speedSlider');
  speedSpan = select('#speed');

  // Grid cell size
  ww = width / cols;
  hh = height / rows;
  background("#83E801");

  TestPegBoard = new CreateBoard(cols, rows);
  TestPegBoard.SetupPegs();
  TestPegBoard.ShowPegs();
  numofbrain = 70;
  brain_input = (cols * rows) * numofbrain;
  brain = new NeuralNetwork(brain_input, 20, 3);
  LoadBrain();
}

function SetupGame() {
  TestPegBoard.SetupPegs();
  TestPegBoard.ShowPegs();
}

function mousePressed() {
  // if (mouseY < mycanvas.top | mouseX < mycanvas.left) return false;

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
    if (mouseXY[0] < 7 & mouseXY[0] > 0 & mouseXY[1] < 7 & mouseXY[1] > 0) {
      if (TestPegBoard.MovePeg(mouseXY[0], mouseXY[1], md, true) === true) {
        background("#83E801");
        TestPegBoard.UpdatePegs();
        TestPegBoard.ShowPegs();
      } else {
        console.log('error!')
      }
    }
    mouseXY = [];
  } else {
    mouseXY[0] = mx;
    mouseXY[1] = my;
    ellipse(mouseXY[0] * ww + ww / 2, mouseXY[1] * hh + hh / 2, ww / 2, hh / 2);
  }
  // console.log(x, y)

  // prevent default
  return true;
}

// Toggle the state of the simulation
function toggleState() {
  trybrain = !trybrain;

  // Show the best 
  if (trybrain) {
    train = !trybrain;
    // SetupGame;
    // TestPegBoard.SetupPegs();
    aicount = floor(random(0, numofbrain - 1))
    TryBrainButton.html('Try manuel');
    speedSlider.value(15);
    // Go train some more
  } else {
    TryBrainButton.html('  Try AI  ');
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


function draw() {
  let cycles = speedSlider.value();
  let nn_input = [];

  speedSpan.html(cycles);
  setFrameRate(cycles);


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
        //   // TestPegBoard.SetupPegs();
        //   aicount++;
        //   if (aicount > numofbrain - 1) aicount = 0;

        console.log('aicount ' + aicount);

        TestPegBoard.ShowPegs();
        textSize(40)
        fill(100, 200, 100, 200);
        text('Game Over', 100, 180);
      }

    }

  } else if (trybrain) {

    if (speedSlider.value() <= 59) {

      TestPegBoard.ShowPegs();
    }
    nn_input = FillInput(aicount, TestPegBoard.nn_input)
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
      aicount++;
      if (aicount > numofbrain - 1) {
        aicount = brainfail;
        if (brainfail < numofbrain - 1) {
          brainfail++;
          console.log('brainfail ' + brainfail);
          // TestPegBoard.SetupPegs();
        } else {
          brainfail = 0;
        }

      }
      console.log(aicount);
      // pin_w = round(((rows - 1) / 100) * (rawprediction[3] * 100));
      // pin_h = round(((cols - 1) / 100) * (rawprediction[4] * 100));
      // pinmove = round(((3) / 100) * (rawprediction[5] * 100));
      // console.log(pin_w, pin_h, pinmove);
      // if (TestPegBoard.MovePeg(pin_w, pin_h, pinmove, true) === false) {
      //   console.log('somthing went wrong 22 !!!!');
      //   aicount++;

      // }
    } else {
      domove = true;
      pegsleft = TestPegBoard.UpdatePegs();
      // TestPegBoard.ShowPegs();
      if (pegsleft === 1) trybrain = false;
    }
  }
}


function getdata(json) {
  // TestPegBoard = TrainPegBoard;

  brain = NeuralNetwork.deserialize(json);

  // TestPegBoard.SetupPegs();
  speedSlider.value(15);

  // trybrain = true;
  TryBrainButton.html('AI Game');
}

function LoadBrain() {
  loadJSON('GameBrain.json', getdata);
}